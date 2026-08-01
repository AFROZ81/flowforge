namespace FlowForge.Application.Services.Users;

public interface IUserService
{
    Task<UserInfo?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<List<UserInfo>> GetByOrganizationAsync(Guid organizationId, CancellationToken cancellationToken = default);
}