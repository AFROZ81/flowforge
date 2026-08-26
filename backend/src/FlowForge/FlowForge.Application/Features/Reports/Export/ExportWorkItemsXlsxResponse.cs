namespace FlowForge.Application.Features.Reports.Export;

public sealed class ExportWorkItemsXlsxResponse
{
    public byte[] Content { get; init; } = [];

    public string FileName { get; init; } = string.Empty;

    public string ContentType { get; init; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}