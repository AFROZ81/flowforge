namespace FlowForge.Application.Common.Models;

public sealed class OrganizationUserLookup
{
    public Guid Id { get; init; }

    public string FullName { get; init; } = string.Empty;

    public string? Email { get; init; }
}