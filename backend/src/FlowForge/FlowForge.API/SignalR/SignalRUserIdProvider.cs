using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace FlowForge.API.SignalR;

public sealed class SignalRUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }
}