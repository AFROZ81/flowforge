using MediatR;
using FlowForge.Domain.Enums;

namespace FlowForge.Application.Features.Organizations.Invitations.Create;

/// <summary>
/// Command to create a new organization invitation.
/// </summary>
public sealed class CreateInvitationCommand : IRequest<CreateInvitationResponse>
{
    public string Email { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public string? Message { get; init; }
    public Guid OrganizationId { get; init; }
}