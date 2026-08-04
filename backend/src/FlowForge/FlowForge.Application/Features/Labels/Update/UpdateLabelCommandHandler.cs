using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Labels.Update;

public sealed class UpdateLabelCommandHandler : IRequestHandler<UpdateLabelCommand, ApiResponse<UpdateLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public UpdateLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules)
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<UpdateLabelResponse>> Handle(UpdateLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var label = await _labelRules.GetByIdAsync(request.LabelId, currentUser.OrganizationId, cancellationToken);

        await _labelRules.EnsureNameUniqueAsync(currentUser.OrganizationId, request.Name, label.Id, cancellationToken);

        label.Update(request.Name, request.Color, request.Description);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<UpdateLabelResponse>.SuccessResponse(
            new UpdateLabelResponse
            {
                Id = label.Id,
                OrganizationId = label.OrganizationId,
                Name = label.Name,
                Color = label.Color,
                Description = label.Description,
                UpdatedAt = label.UpdatedAt
            },
            "Label updated successfully.");
    }
}