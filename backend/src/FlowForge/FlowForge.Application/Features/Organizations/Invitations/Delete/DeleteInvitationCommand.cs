using MediatR;

namespace FlowForge.Application.Features.Organizations.Invitations.Delete;

/// <summary>
/// Command to delete/revoke an organization invitation.
/// </summary>
public sealed class DeleteInvitationCommand : IRequest
{
    public Guid Id { get; init; }
}