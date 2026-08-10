using FlowForge.Application.Common.Responses;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;

namespace FlowForge.Application.Features.Users.GetOrganizationUsers;

public sealed class GetOrganizationUsersQueryHandler
    : IRequestHandler<
        GetOrganizationUsersQuery,
        ApiResponse<List<GetOrganizationUsersResponse>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetOrganizationUsersQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<
        ApiResponse<List<GetOrganizationUsersResponse>>>
        Handle(
            GetOrganizationUsersQuery request,
            CancellationToken cancellationToken)
    {
        var organizationId =
            _currentUser.User.OrganizationId;

        var users =
            await _context.GetOrganizationUsersAsync(
                organizationId,
                cancellationToken);

        var response =
            users
                .Select(user =>
                    new GetOrganizationUsersResponse
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email
                    })
                .ToList();

        return ApiResponse<
            List<GetOrganizationUsersResponse>>
            .SuccessResponse(
                response);
    }
}