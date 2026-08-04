namespace FlowForge.Application.Common.Exceptions;

/// <summary>
/// Represents a bad request exception.
/// </summary>
public sealed class BadRequestException : Exception
{
    public BadRequestException(string message) : base(message)
    {
    }
}