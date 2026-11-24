using System.ComponentModel.DataAnnotations;
using MediatR;
using FlowForge.Application.Services.AuditLogs;

namespace FlowForge.Application.Features.AuditLogs.GetAuditLogs;

/// <summary>
/// Request to get audit logs with filtering and pagination.
/// </summary>
public sealed class GetAuditLogsRequest : IRequest<PagedResult<GetAuditLogsResponse>>
{
    public Guid OrganizationId { get; init; }

    public int Page { get; init; } = 1;

    public int PageSize { get; init; } = 50;

    public DateTime? FromDate { get; init; }

    public DateTime? ToDate { get; init; }

    public FlowForge.Domain.Enums.AuditLogType? Type { get; init; }

    public Guid? ActorId { get; init; }

    public Guid? TargetEntityId { get; init; }

    public string? TargetEntityType { get; init; }

    public string? ActorIdStr { get; init; }

    public bool? IsSensitive { get; init; }

    public string? Search { get; init; }

    public string SortBy { get; init; } = "CreatedAt";

    public bool SortDescending { get; init; } = true;
}