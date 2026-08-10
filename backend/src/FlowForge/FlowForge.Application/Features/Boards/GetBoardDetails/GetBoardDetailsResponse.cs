using FlowForge.Domain.Common.Enums;

namespace FlowForge.Application.Features.Boards.GetBoardDetails;

public sealed class GetBoardDetailsResponse
{
    public Guid Id { get; init; }

    public Guid ProjectId { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public bool IsArchived { get; init; }

    public List<BoardColumnDto> Columns { get; init; } = [];
}

public sealed class BoardColumnDto
{
    public Guid Id { get; init; }

    public string Name { get; init; } = string.Empty;

    public string? Description { get; init; }

    public int DisplayOrder { get; init; }

    public List<BoardWorkItemDto> WorkItems { get; init; } = [];
}

public sealed class BoardWorkItemDto
{
    public Guid Id { get; init; }

    public string Title { get; init; } = string.Empty;

    public string? Description { get; init; }

    public WorkItemPriority Priority { get; init; }

    public WorkItemStatus Status { get; init; }

    public long DisplayOrder { get; init; }

    public DateTime? DueDate { get; init; }

    public bool IsArchived { get; init; }

    // ADD THIS
    public Guid? AssigneeId { get; init; }
}