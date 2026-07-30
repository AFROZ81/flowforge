namespace FlowForge.Application.Services.Attachments;

public sealed class FileUploadRequest
{
    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;

    public long FileSize { get; init; }

    public Stream Content { get; init; } = Stream.Null;
}