using MediatR;
using FlowForge.Application.Common.Responses;

namespace FlowForge.Application.Features.Boards.Create;

public sealed record CreateBoardCommand(Guid ProjectId, string Name, string? Description) : IRequest<ApiResponse<CreateBoardResponse>>;