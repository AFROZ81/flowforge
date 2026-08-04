using FlowForge.Application.Common.Responses;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Columns.GetById;

public sealed class GetColumnByIdQueryHandler
    : IRequestHandler<GetColumnByIdQuery, ApiResponse<GetColumnByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly ColumnRules _columnRules;

    public GetColumnByIdQueryHandler(ICurrentUserService currentUser, ColumnRules columnRules)
    {
        _currentUser = currentUser;
        _columnRules = columnRules;
    }

    public async Task<ApiResponse<GetColumnByIdResponse>> Handle(GetColumnByIdQuery request, CancellationToken cancellationToken)
    {
        var column = await _columnRules.GetByIdAsync(request.Id, _currentUser.User.OrganizationId, cancellationToken);

        var response = new GetColumnByIdResponse
        {
            Id = column.Id,
            BoardId = column.BoardId,
            Name = column.Name,
            Description = column.Description,
            DisplayOrder = column.DisplayOrder,
            IsArchived = column.IsArchived
        };

        return ApiResponse<GetColumnByIdResponse>.SuccessResponse(response, "Column retrieved successfully.");
    }
}