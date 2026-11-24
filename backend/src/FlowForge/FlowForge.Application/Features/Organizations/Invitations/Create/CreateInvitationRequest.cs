using System.ComponentModel.DataAnnotations;
using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Invitations.Create;

/// <summary>
/// Request to create a new organization invitation.
/// </summary>
public sealed class CreateInvitationRequest
{
    /// <summary>
    /// Email address of the user to invite.
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; init; } = string.Empty;

    /// <summary>
    /// Role to assign to the invited user.
    /// </summary>
    [Required]
    public UserRole Role { get; init; } = UserRole.Member;

    /// <summary>
    /// Optional personal message from the inviter.
    /// </summary>
    [StringLength(500)]
    public string? Message { get; init; }

    /// <summary>
    /// The organization ID for the invitation.
    /// </summary>
    [Required]
    public Guid OrganizationId { get; init; }
}