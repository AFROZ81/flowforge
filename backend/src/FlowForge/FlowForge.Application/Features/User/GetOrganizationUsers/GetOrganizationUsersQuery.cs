using FlowForge.Application.Common.Responses;
using MediatR;

namespace FlowForge.Application.Features.Users.GetOrganizationUsers;

public sealed record GetOrganizationUsersQuery : IRequest<ApiResponse<List<GetOrganizationUsersResponse>>>;