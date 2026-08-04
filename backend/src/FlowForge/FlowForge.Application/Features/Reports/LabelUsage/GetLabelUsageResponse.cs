namespace FlowForge.Application.Features.Reports.LabelUsage;

public sealed class GetLabelUsageResponse
{
    public Guid LabelId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string Color { get; init; } = string.Empty;

    public int UsageCount { get; init; }
}