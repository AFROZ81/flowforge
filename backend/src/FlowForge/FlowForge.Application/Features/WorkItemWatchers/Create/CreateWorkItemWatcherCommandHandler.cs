using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Users;
using FlowForge.Domain.Entities;
using FlowForge.Application.Services.WorkItemHistories;
using FlowForge.Domain.Enums;

using MediatR;

namespace FlowForge.Application.Features.WorkItemWatchers.Create;

public sealed class CreateWorkItemWatcherCommandHandler : IRequestHandler<CreateWorkItemWatcherCommand, ApiResponse<CreateWorkItemWatcherResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserService _userService;
    private readonly WorkItemWatcherRules _rules;
    private readonly IWorkItemHistoryService _historyService;

    public CreateWorkItemWatcherCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, IUserService userService, WorkItemWatcherRules rules, IWorkItemHistoryService historyService)
    {
        _context = context;
        _currentUser = currentUser;
        _userService = userService;
        _rules = rules;
        _historyService = historyService;
    }

    public async Task<ApiResponse<CreateWorkItemWatcherResponse>> Handle(CreateWorkItemWatcherCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var workItem = await _rules.GetWorkItemAsync(request.WorkItemId, currentUser.OrganizationId, cancellationToken);

        _rules.EnsureWorkItemNotArchived(workItem);

        var user = await _userService.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            throw new NotFoundException("User not found.");

        if (user.OrganizationId != currentUser.OrganizationId)
            throw new BadRequestException("The selected user does not belong to this organization.");

        var existingWatcher = await _rules.GetWatcherAsync(
            workItem.Id,
            user.Id,
            cancellationToken);

        if (existingWatcher is not null)
            throw new BadRequestException(
                "This user is already watching the Work Item.");

        var watcher = new WorkItemWatcher(workItem.Id, user.Id);

        _context.WorkItemWatchers.Add(watcher);

        await _rules.SaveChangesAsync(cancellationToken);

        await _historyService.CreateAsync(
            workItem.Id,
            currentUser.UserId,
            WorkItemHistoryAction.WatcherAdded,
            $"{currentUser.FullName} added {user.FullName} as a watcher.",
            cancellationToken);

        return ApiResponse<CreateWorkItemWatcherResponse>
            .SuccessResponse(
                new CreateWorkItemWatcherResponse
                {
                    Id = watcher.Id,
                    WorkItemId = watcher.WorkItemId,
                    UserId = watcher.UserId,
                    CreatedAt = watcher.CreatedAt
                },
                "Watcher added successfully.");
    }
}