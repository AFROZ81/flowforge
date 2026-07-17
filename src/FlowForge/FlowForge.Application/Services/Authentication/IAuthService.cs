using FlowForge.Application.Features.Authentication.Register;

namespace FlowForge.Application.Services.Authentication;

public interface IAuthService
{

    Task<RegisterResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
}