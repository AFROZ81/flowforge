namespace FlowForge.Application.Features.Dashboard.GetWorkItemTrend;

public sealed class GetWorkItemTrendResponse
{
    public DateTime Date { get; set; }

    public int Created { get; set; }

    public int Completed { get; set; }
}