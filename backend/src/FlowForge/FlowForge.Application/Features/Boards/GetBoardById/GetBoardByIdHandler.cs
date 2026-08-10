using FlowForge.Application.Common.Responses;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Boards.GetBoardById;

public sealed class GetBoardByIdHandler
    : IRequestHandler<
        GetBoardByIdQuery,
        ApiResponse<GetBoardByIdResponse>>
{
    private readonly ICurrentUserService _currentUser;
    private readonly BoardRules _boardRules;

    public GetBoardByIdHandler(
        ICurrentUserService currentUser,
        BoardRules boardRules)
    {
        _currentUser = currentUser;
        _boardRules = boardRules;
    }

    public async Task<
        ApiResponse<GetBoardByIdResponse>
    > Handle(
        GetBoardByIdQuery request,
        CancellationToken cancellationToken)
    {
        var board =
            await _boardRules.GetByIdAsync(
                request.BoardId,
                _currentUser.User.OrganizationId,
                cancellationToken);

        var response =
            new GetBoardByIdResponse
            {
                Id = board.Id,

                ProjectId =
                    board.ProjectId,

                Name =
                    board.Name,

                Description =
                    board.Description,

                IsArchived =
                    board.IsArchived,

                CreatedAt =
                    board.CreatedAt,

                UpdatedAt =
                    board.UpdatedAt,

                Columns =
                    board.Columns
                        .OrderBy(
                            column =>
                                column.DisplayOrder)
                        .Select(
                            column =>
                                new GetBoardColumnResponse
                                {
                                    Id =
                                        column.Id,

                                    Name =
                                        column.Name,

                                    Description =
                                        column.Description,

                                    DisplayOrder =
                                        column.DisplayOrder,

                                    WorkItems =
                                        column.WorkItems
                                            .Where(
                                                item =>
                                                    !item.IsDeleted)
                                            .OrderBy(
                                                item =>
                                                    item.DisplayOrder)
                                            .Select(
                                                item =>
                                                    new GetBoardWorkItemResponse
                                                    {
                                                        Id =
                                                            item.Id,

                                                        Title =
                                                            item.Title,

                                                        Description =
                                                            item.Description,

                                                        Priority =
                                                            (int)item.Priority,

                                                        Status =
                                                            (int)item.Status,

                                                        DisplayOrder =
                                                            item.DisplayOrder,

                                                        DueDate =
                                                            item.DueDate,

                                                        IsArchived =
                                                            item.IsArchived,

                                                        AssigneeId =
                                                            item.AssigneeId
                                                    })
                                            .ToList()
                                })
                        .ToList()
            };

        return ApiResponse<
            GetBoardByIdResponse
        >.SuccessResponse(response);
    }
}