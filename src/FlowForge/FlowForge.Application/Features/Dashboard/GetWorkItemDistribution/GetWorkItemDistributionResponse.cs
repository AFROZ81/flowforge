namespace FlowForge.Application.Features.Dashboard.GetWorkItemDistribution;

public sealed class GetWorkItemDistributionResponse
{
    public List<DashboardDistributionItem> ByStatus { get; init; } = new();

    public List<DashboardDistributionItem> ByPriority { get; init; } = new();
}

public sealed class DashboardDistributionItem
{
    public string Name { get; init; } = string.Empty;

    public int Count { get; init; }

    public decimal Percentage { get; init; }
}