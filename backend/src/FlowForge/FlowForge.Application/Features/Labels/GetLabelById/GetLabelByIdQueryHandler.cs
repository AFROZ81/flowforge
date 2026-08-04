using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Labels.GetLabelById;

public sealed class GetLabelByIdQueryHandler : IRequestHandler<GetLabelByIdQuery, ApiResponse<GetLabelByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public GetLabelByIdQueryHandler(ICurrentUserService currentUser, LabelRules labelRules)
    {
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<GetLabelByIdResponse>> Handle(GetLabelByIdQuery request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        var label = await _labelRules.GetByIdAsync(request.Id, currentUser.OrganizationId, cancellationToken);

        return ApiResponse<GetLabelByIdResponse>.SuccessResponse(
            new GetLabelByIdResponse
            {
                Id = label.Id,
                OrganizationId = label.OrganizationId,
                Name = label.Name,
                Color = label.Color,
                Description = label.Description,
                CreatedAt = label.CreatedAt,
                UpdatedAt = label.UpdatedAt
            },
            "Label retrieved successfully.");
    }
}