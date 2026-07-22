namespace FlowForge.Application.Common.Pagination;

public abstract record PagedRequest
{
    private const int MaxPageSize = 100;

    private int _pageSize = 20;

    public int Page { get; init; } = 1;

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value > MaxPageSize
            ? MaxPageSize
            : value;
    }

    public string? Search { get; init; }

    public string? SortBy { get; init; }

    public string SortDirection { get; init; } = "asc";
}   