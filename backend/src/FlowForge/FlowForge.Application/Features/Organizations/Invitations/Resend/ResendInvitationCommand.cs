using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Resend;

/// <summary>
/// Command to resend an organization invitation.
/// </summary>
public sealed class ResendInvitationCommand : IRequest
{
    public Guid Id { get; init; }
}