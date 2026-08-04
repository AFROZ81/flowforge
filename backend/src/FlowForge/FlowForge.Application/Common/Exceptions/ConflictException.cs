namespace FlowForge.Application.Common.Exceptions;

/// <summary>
/// Represents a conflict exception.
/// </summary>
public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}