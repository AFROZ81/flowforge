namespace FlowForge.Application.Common.Exceptions;

/// <summary>
/// Represents a forbidden exception.
/// </summary>
public sealed class ForbiddenException : Exception
{
    public ForbiddenException(string message) : base(message)
    {
    }
}