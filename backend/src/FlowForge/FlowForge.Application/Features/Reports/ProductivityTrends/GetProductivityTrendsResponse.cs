namespace FlowForge.Application.Features.Reports.ProductivityTrends;

public sealed class GetProductivityTrendsResponse
{
    public DateOnly Date { get; init; }

    public int Created { get; init; }

    public int Completed { get; init; }
}