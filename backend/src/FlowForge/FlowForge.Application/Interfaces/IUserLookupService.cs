namespace FlowForge.Application.Interfaces;

/// <summary>
/// Represents a user for lookup purposes.
/// </summary>
public sealed class UserLookupResult
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
}

/// <summary>
/// Service for looking up users by email or ID.
/// </summary>
public interface IUserLookupService
{
    /// <summary>
    /// Finds a user by email address.
    /// </summary>
    Task<UserLookupResult?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);

    /// <summary>
    /// Finds a user by ID.
    /// </summary>
    Task<UserLookupResult?> FindByIdAsync(Guid userId, CancellationToken cancellationToken = default);
}