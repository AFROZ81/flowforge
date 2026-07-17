using Microsoft.AspNetCore.Identity;
using FlowForge.Domain.Entities;

namespace FlowForge.Infrastructure.Identity;

/// <summary>
/// Represents an application user.
/// </summary>
public sealed class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public Guid OrganizationId { get; set; }

    public Organization Organization { get; set; } = default!;
}