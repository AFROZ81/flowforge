using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Domain.Entities;
using MediatR;

namespace FlowForge.Application.Features.Labels.Create;

public sealed class CreateLabelCommandHandler : IRequestHandler<CreateLabelCommand, ApiResponse<CreateLabelResponse>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly LabelRules _labelRules;

    public CreateLabelCommandHandler(IApplicationDbContext context, ICurrentUserService currentUser, LabelRules labelRules) 
    {
        _context = context;
        _currentUser = currentUser;
        _labelRules = labelRules;
    }

    public async Task<ApiResponse<CreateLabelResponse>> Handle(CreateLabelCommand request, CancellationToken cancellationToken)
    {
        var currentUser = _currentUser.User;

        await _labelRules.EnsureNameUniqueAsync(currentUser.OrganizationId, request.Name, null, cancellationToken);

        var label = new Label(currentUser.OrganizationId, request.Name, request.Color, request.Description);

        _context.Labels.Add(label);

        await _context.SaveChangesAsync(cancellationToken);

        return ApiResponse<CreateLabelResponse>.SuccessResponse(
            new CreateLabelResponse
            {
                Id = label.Id,
                OrganizationId = label.OrganizationId,
                Name = label.Name,
                Color = label.Color,
                Description = label.Description,
                CreatedAt = label.CreatedAt
            },
            "Label created successfully.");
    }
}