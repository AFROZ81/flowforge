using Microsoft.AspNetCore.Identity;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;

namespace FlowForge.Infrastructure.Identity;

/// <summary>
/// Represents an application user.
/// </summary>
public sealed class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;

    public Guid OrganizationId { get; set; }

    public ICollection<OrganizationUser> OrganizationUsers { get; private set; } = new List<OrganizationUser>();

    public UserRole Role { get; set; } = UserRole.Member;
}