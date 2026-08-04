using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.Authentication.Login;

namespace FlowForge.Application.Services.Authentication;

public interface ITokenService
{
    TokenResult GenerateAccessToken(AuthenticatedUser user);
}