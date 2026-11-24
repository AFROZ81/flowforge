namespace FlowForge.Application.Features.AuditLogs.GetAuditLogs;

/// <summary>
/// Response item for audit log listing.
/// </summary>
public sealed class GetAuditLogsResponse
{
    public Guid Id { get; init; }

    public string Type { get; init; } = string.Empty;

    public Guid OrganizationId { get; init; }

    public Guid? ActorId { get; init; }

    public string ActorName { get; init; } = string.Empty;

    public string ActorIpAddress { get; init; } = string.Empty;

    public Guid? TargetEntityId { get; init; }

    public string TargetEntityType { get; init; } = string.Empty;

    public string Action { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    public string OldValuesJson { get; init; } = "{}";

    public string NewValuesJson { get; init; } = "{}";

    public string MetadataJson { get; init; } = "{}";

    public bool IsSensitive { get; init; }

    public DateTime CreatedAt { get; init; }
}