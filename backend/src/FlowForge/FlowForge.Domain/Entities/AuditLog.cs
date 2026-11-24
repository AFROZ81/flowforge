using FlowForge.Domain.Common.Base;
using FlowForge.Domain.Enums;

namespace FlowForge.Domain.Entities;

/// <summary>
/// Represents an audit log entry for compliance and security auditing.
/// </summary>
public sealed class AuditLog : EntityBase
{
    public AuditLogType Type { get; private set; }

    public Guid OrganizationId { get; private set; }

    public Guid? ActorId { get; private set; }

    public string ActorName { get; private set; } = string.Empty;

    public string ActorIpAddress { get; private set; } = string.Empty;

    public string ActorUserAgent { get; private set; } = string.Empty;

    public Guid? TargetEntityId { get; private set; }

    public string TargetEntityType { get; private set; } = string.Empty;

    public string Action { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    public string OldValuesJson { get; private set; } = string.Empty;

    public string NewValuesJson { get; private set; } = string.Empty;

    public string MetadataJson { get; private set; } = string.Empty;

    public bool IsSensitive { get; private set; }

    private AuditLog()
    {
    }

    public static AuditLog Create(
        AuditLogType type,
        Guid organizationId,
        Guid? actorId,
        string actorName,
        string actorIpAddress,
        string actorUserAgent,
        Guid? targetEntityId,
        string targetEntityType,
        string action,
        string description,
        string oldValuesJson = "{}",
        string newValuesJson = "{}",
        string metadataJson = "{}",
        bool isSensitive = false)
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            Type = type,
            OrganizationId = organizationId,
            ActorId = actorId,
            ActorName = actorName,
            ActorIpAddress = actorIpAddress,
            ActorUserAgent = actorUserAgent,
            TargetEntityId = targetEntityId,
            TargetEntityType = targetEntityType,
            Action = action,
            Description = description,
            OldValuesJson = oldValuesJson,
            NewValuesJson = newValuesJson,
            MetadataJson = metadataJson,
            IsSensitive = isSensitive,
            CreatedAt = DateTime.UtcNow
        };
    }
}