namespace FlowForge.Application.Features.Attachments.Download;

public sealed class DownloadAttachmentResponse
{
    public Stream Content { get; init; } = Stream.Null;

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = string.Empty;
}