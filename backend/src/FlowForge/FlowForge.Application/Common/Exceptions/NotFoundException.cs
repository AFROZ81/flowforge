namespace FlowForge.Application.Common.Exceptions;

/// <summary>
/// Represents a resource not found exception.
/// </summary>
public sealed class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}