namespace FlowForge.Application.Common.Exceptions;

/// <summary>
/// Represents an unauthorized exception.
/// </summary>
public sealed class UnauthorizedException : Exception
{
    public UnauthorizedException(string message) : base(message)
    {
    }
}