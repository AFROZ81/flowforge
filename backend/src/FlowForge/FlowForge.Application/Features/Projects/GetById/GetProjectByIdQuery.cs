using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.GetById;

public sealed record GetProjectByIdQuery(Guid Id) : IRequest<ApiResponse<GetProjectByIdResponse>>;