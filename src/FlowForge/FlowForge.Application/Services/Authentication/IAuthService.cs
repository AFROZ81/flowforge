using FlowForge.Application.Features.Authentication.Register;
using FlowForge.Application.Features.Authentication.Login;

namespace FlowForge.Application.Services.Authentication;

public interface IAuthService
{

    Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    Task<LoginResponse> LoginAsync(LoginRequest request);
}