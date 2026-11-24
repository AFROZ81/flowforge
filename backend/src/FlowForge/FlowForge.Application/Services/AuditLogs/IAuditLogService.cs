using FlowForge.Application.Features.AuditLogs.GetAuditLogs;

namespace FlowForge.Application.Services.AuditLogs;

/// <summary>
/// Interface for audit log service.
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Creates an audit log entry.
    /// </summary>
    Task CreateAsync(AuditLogEntry entry, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit logs with filtering and pagination.
    /// </summary>
    Task<PagedResult<GetAuditLogsResponse>> GetAsync(GetAuditLogsRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets audit log statistics for the organization.
    /// </summary>
    Task<AuditLogStatistics> GetStatisticsAsync(Guid organizationId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Represents an audit log entry to be created.
/// </summary>
public sealed record AuditLogEntry
{
    public required FlowForge.Domain.Enums.AuditLogType Type { get; init; }
    public required Guid OrganizationId { get; init; }
    public Guid? ActorId { get; init; }
    public string ActorName { get; init; } = string.Empty;
    public string ActorIpAddress { get; init; } = string.Empty;
    public string ActorUserAgent { get; init; } = string.Empty;
    public Guid? TargetEntityId { get; init; }
    public string TargetEntityType { get; init; } = string.Empty;
    public string Action { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string OldValuesJson { get; init; } = "{}";
    public string NewValuesJson { get; init; } = "{}";
    public string MetadataJson { get; init; } = "{}";
    public bool IsSensitive { get; init; }
}

/// <summary>
/// Paged result wrapper.
/// </summary>
public sealed class PagedResult<T>
{
    public required List<T> Items { get; init; }
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}

/// <summary>
/// Audit log statistics for an organization.
/// </summary>
public sealed class AuditLogStatistics
{
    public int TotalEntries { get; init; }
    public int SensitiveEntries { get; init; }
    public int TodayEntries { get; init; }
    public Dictionary<string, int> ByType { get; init; } = new();
    public Dictionary<string, int> ByActor { get; init; } = new();
}