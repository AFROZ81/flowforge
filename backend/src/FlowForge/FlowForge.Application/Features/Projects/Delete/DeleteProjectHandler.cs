using System.Text.Json;
using FlowForge.Application.Common.Constants;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FlowForge.Application.Features.Projects.Delete;

public sealed class DeleteProjectHandler : IRequestHandler<DeleteProjectCommand, ApiResponse<DeleteProjectResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ProjectRules _projectRules;
    private readonly IAuditLogService _auditLogService;
    private readonly IRealtimeNotifier _realtimeNotifier;
    private readonly ILogger<DeleteProjectHandler> _logger;

    public DeleteProjectHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        ProjectRules projectRules,
        IAuditLogService auditLogService,
        IRealtimeNotifier realtimeNotifier,
        ILogger<DeleteProjectHandler> logger)
    {
        _context = context;
        _currentUser = currentUser;
        _projectRules = projectRules;
        _auditLogService = auditLogService;
        _realtimeNotifier = realtimeNotifier;
        _logger = logger;
    }

    public async Task<ApiResponse<DeleteProjectResponse>> Handle(DeleteProjectCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;
        if (currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can delete projects.");
        }

        var project = await _projectRules.GetByIdAsync(
            request.ProjectId,
            currentUser.OrganizationId,
            cancellationToken);

        var boardCount = await _context.Boards
            .CountAsync(x => x.ProjectId == project.Id, cancellationToken);

        if (boardCount > 0)
        {
            throw new ConflictException(
                $"Project cannot be deleted while it contains {boardCount} active board(s). Archive it instead or delete the boards first.");
        }

        project.Delete();

        await _context.ExecuteInTransactionAsync(async () =>
        {
            await _context.SaveChangesAsync(cancellationToken);

            await _auditLogService.CreateAsync(new AuditLogEntry
            {
                Type = AuditLogType.ProjectDeleted,
                OrganizationId = currentUser.OrganizationId,
                ActorId = currentUser.UserId,
                ActorName = currentUser.FullName,
                TargetEntityId = project.Id,
                TargetEntityType = "Project",
                Action = "Deleted",
                Description = $"Soft-deleted project \"{project.Name}\".",
                OldValuesJson = JsonSerializer.Serialize(new
                {
                    project.Name,
                    project.Key,
                }),
                IsSensitive = true,
            }, cancellationToken);
        }, cancellationToken);

        try
        {
            await _realtimeNotifier.NotifyOrganizationAsync(
                currentUser.OrganizationId,
                RealtimeEvents.ProjectDeleted,
                new { ProjectId = project.Id },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Deleted project {ProjectId}, but failed to send its realtime notification.",
                project.Id);
        }

        return ApiResponse<DeleteProjectResponse>.SuccessResponse(
            new DeleteProjectResponse
            {
                Id = project.Id,
                DeletedAt = project.DeletedAt ?? DateTime.UtcNow,
            },
            "Project deleted.");
    }
}
