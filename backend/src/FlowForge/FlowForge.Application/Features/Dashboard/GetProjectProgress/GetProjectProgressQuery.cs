using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Dashboard.GetProjectProgress;

public sealed record GetProjectProgressQuery : IRequest<ApiResponse<List<GetProjectProgressResponse>>>;