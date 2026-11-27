using System.Text.Json;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Features.Boards.Delete;

public sealed class DeleteBoardHandler : IRequestHandler<DeleteBoardCommand, ApiResponse<DeleteBoardResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;
    private readonly IAuditLogService _auditLogService;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly ILogger<DeleteBoardHandler> _logger;

    public DeleteBoardHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        BoardRules boardRules,
        IAuditLogService auditLogService,
        IRealtimeNotifier realtimeNotifier,
        ILogger<DeleteBoardHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _boardRules = boardRules;
        _auditLogService = auditLogService;
        _realtimeNotifier = realtimeNotifier;
        _logger = logger;
    }

    public async Task<ApiResponse<DeleteBoardResponse>> Handle(DeleteBoardCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;
        if (currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can delete boards.");
        }

        var board = await _boardRules.GetByIdAsync(
            request.BoardId,
            currentUser.OrganizationId,
            cancellationToken);

        var columnCount = await _context.Columns
            .CountAsync(x => x.BoardId == board.Id, cancellationToken);

        if (columnCount > 0)
        {
            throw new ConflictException(
                $"Board cannot be deleted while it contains {columnCount} active column(s). Archive it instead or delete the columns first.");
        }

        board.Delete();

        await _context.ExecuteInTransactionAsync(async () =>
        {
            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.BoardDeleted,
                OrganizationId = currentUser.OrganizationId,
                ActorId = currentUser.UserId,
                ActorName = currentUser.FullName,
                TargetEntityId = board.Id,
                TargetEntityType = "Board",
                Action = "Deleted",
                Description = $"Soft-deleted board \"{board.Name}\".",
                OldValuesJson = JsonSerializer.Serialize(new
                {
                    board.Name,
                    board.ProjectId,
                }),
                IsSensitive = true,
            }, cancellationToken);
        }, cancellationToken);

        try
        {
            await _realtimeNotifier.NotifyBoardAsync(
                board.Id,
                RealtimeEvents.BoardDeleted,
                new { BoardId = board.Id, ProjectId = board.ProjectId },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Deleted board {BoardId}, but failed to send its realtime notification.",
                board.Id);
        }

        return ApiResponse<DeleteBoardResponse>.SuccessResponse(
            new DeleteBoardResponse
            {
                Id = board.Id,
                DeletedAt = board.DeletedAt ?? DateTime.UtcNow,
            },
            "Board deleted.");
    }
}
