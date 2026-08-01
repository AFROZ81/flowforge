namespace FlowForge.Application.Features.Reports.Export;

public sealed class ExportWorkItemsCsvResponse
{
    public byte[] Content { get; init; } = [];

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = "text/csv";
}