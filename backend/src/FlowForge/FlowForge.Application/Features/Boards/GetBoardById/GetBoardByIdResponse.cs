namespace FlowForge.Application.Features.Boards.GetBoardById;

public sealed class GetBoardByIdResponse
{
    public Guid Id { get; init; }

    public Guid ProjectId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsArchived { get; init; }

    public DateTime CreatedAt { get; init; }

    public DateTime? UpdatedAt { get; init; }

    public List<GetBoardColumnResponse> Columns { get; init; } = [];
}

public sealed class GetBoardColumnResponse
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public long DisplayOrder { get; init; }

    public List<GetBoardWorkItemResponse> WorkItems { get; init; } = [];
}

public sealed class GetBoardWorkItemResponse
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int Priority { get; init; }

    public int Status { get; init; }

    public long DisplayOrder { get; init; }

    public DateTime? DueDate { get; init; }

    public bool IsArchived { get; init; }

    public Guid? AssigneeId { get; init; }
}