using FlowForge.Application.Features.Authentication.CurrentUser;

namespace FlowForge.Application.Services.Authentication;

public interface ICurrentUserService
{
    AuthenticatedUser User { get; }
}