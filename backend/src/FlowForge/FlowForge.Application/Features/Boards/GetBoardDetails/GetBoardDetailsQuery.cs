using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Boards.GetBoardDetails;

public sealed record GetBoardDetailsQuery(Guid BoardId) : IRequest<ApiResponse<GetBoardDetailsResponse>>;