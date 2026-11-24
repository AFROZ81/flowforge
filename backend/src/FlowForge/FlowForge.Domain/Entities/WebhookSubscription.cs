using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents a webhook subscription for an organization.
/// </summary>
public sealed class WebhookSubscription : EntityBase
{
    public required string Name { get; set; }

    public required string Url { get; set; }

    public string? Secret { get; set; }

    public required string EventTypes { get; set; }

    public bool IsActive { get; set; } = true;

    public int ConsecutiveFailures { get; set; } = 0;

    public DateTime? LastTriggeredAt { get; set; }

    public DateTime? LastFailedAt { get; set; }

    public string? LastFailureReason { get; set; }

    public Guid OrganizationId { get; init; }

    public Organization Organization { get; init; } = default!;
}