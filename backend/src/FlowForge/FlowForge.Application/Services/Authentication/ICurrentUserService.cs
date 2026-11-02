using FlowForge.Application.Features.Authentication.CurrentUser;

namespace FlowForge.Application.Services.Authentication;

public interface ICurrentUserService
{
    /// <summary>
    /// The signed-in principal. Throws when there is none, or when the
    /// identity claims it is built from are incomplete.
    /// </summary>
    AuthenticatedUser User { get; }

    /// <summary>
    /// The signed-in principal, or <c>null</c> when the request is anonymous
    /// or its claims are incomplete.
    /// <para>
    /// For the handful of places that must keep working before anyone has
    /// signed in — audit stamping on a signup write, for instance. Anything
    /// that genuinely requires a user should keep using <see cref="User"/>.
    /// </para>
    /// </summary>
    AuthenticatedUser? TryGetUser();
}
