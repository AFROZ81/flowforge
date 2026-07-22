using FlowForge.Application.Common.Pagination;
using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Projects.GetAll;

public sealed record GetProjectsQuery : PagedRequest, IRequest<ApiResponse<PagedResponse<ProjectDto>>>;