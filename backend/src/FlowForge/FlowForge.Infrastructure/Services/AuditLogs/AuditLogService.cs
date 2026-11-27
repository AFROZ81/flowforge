using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Common.Time;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Infrastructure.Services.AuditLogs;

/// <summary>
/// Implementation of audit log service.
/// </summary>
public sealed class AuditLogService : IAuditLogService
{
    private readonly IApplicationDbContext _context;

    public AuditLogService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CreateAsync(AuditLogEntry entry, CancellationToken cancellationToken = default)
    {
        var auditLog = AuditLog.Create(
            entry.Type,
            entry.OrganizationId,
            entry.ActorId,
            entry.ActorName,
            entry.ActorIpAddress,
            entry.ActorUserAgent,
            entry.TargetEntityId,
            entry.TargetEntityType,
            entry.Action,
            entry.Description,
            entry.OldValuesJson,
            entry.NewValuesJson,
            entry.MetadataJson,
            entry.IsSensitive);

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<PagedResult<GetAuditLogsResponse>> GetAsync(GetAuditLogsRequest request, CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.OrganizationId == request.OrganizationId && !a.IsDeleted);

        if (request.FromDate.HasValue)
            query = query.Where(a => a.CreatedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.CreatedAt <= request.ToDate.Value.AddDays(1));

        if (request.Type.HasValue)
            query = query.Where(a => a.Type == request.Type.Value);

        if (request.ActorId.HasValue)
            query = query.Where(a => a.ActorId == request.ActorId.Value);

        if (request.TargetEntityId.HasValue)
            query = query.Where(a => a.TargetEntityId == request.TargetEntityId.Value);

        if (!string.IsNullOrWhiteSpace(request.TargetEntityType))
            query = query.Where(a => a.TargetEntityType == request.TargetEntityType);

        if (request.IsSensitive.HasValue)
            query = query.Where(a => a.IsSensitive == request.IsSensitive.Value);

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(a =>
                a.Description.ToLower().Contains(request.Search!.ToLower()) ||
                a.Action.ToLower().Contains(request.Search!.ToLower()) ||
                a.ActorName.ToLower().Contains(request.Search!.ToLower()) ||
                a.TargetEntityType.ToLower().Contains(request.Search!.ToLower()));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        query = request.SortBy switch
        {
            "CreatedAt" => request.SortDescending
                ? query.OrderByDescending(a => a.CreatedAt)
                : query.OrderBy(a => a.CreatedAt),
            "Type" => request.SortDescending
                ? query.OrderByDescending(a => a.Type)
                : query.OrderBy(a => a.Type),
            "Action" => request.SortDescending
                ? query.OrderByDescending(a => a.Action)
                : query.OrderBy(a => a.Action),
            "ActorName" => request.SortDescending
                ? query.OrderByDescending(a => a.ActorName)
                : query.OrderBy(a => a.ActorName),
            "TargetEntityType" => request.SortDescending
                ? query.OrderByDescending(a => a.TargetEntityType)
                : query.OrderBy(a => a.TargetEntityType),
            "TargetEntityId" => request.SortDescending
                ? query.OrderByDescending(a => a.TargetEntityId)
                : query.OrderBy(a => a.TargetEntityId),
            "ActorIpAddress" => request.SortDescending
                ? query.OrderByDescending(a => a.ActorIpAddress)
                : query.OrderBy(a => a.ActorIpAddress),
            _ => request.SortDescending
                ? query.OrderByDescending(a => a.CreatedAt)
                : query.OrderBy(a => a.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new GetAuditLogsResponse
            {
                Id = a.Id,
                Type = a.Type.ToString(),
                OrganizationId = a.OrganizationId,
                ActorId = a.ActorId,
                ActorName = a.ActorName,
                ActorIpAddress = a.ActorIpAddress,
                TargetEntityId = a.TargetEntityId,
                TargetEntityType = a.TargetEntityType,
                Action = a.Action,
                Description = a.Description,
                OldValuesJson = a.OldValuesJson,
                NewValuesJson = a.NewValuesJson,
                MetadataJson = a.MetadataJson,
                IsSensitive = a.IsSensitive,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<GetAuditLogsResponse>
        {
            Items = items,
            TotalCount = (int)totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }

    public async Task<AuditLogStatistics> GetStatisticsAsync(Guid organizationId, CancellationToken cancellationToken = default)
    {
        var todayStart = AppTime.IndiaDayStartUtc(AppTime.TodayInIndia);

        var totalEntries = await _context.AuditLogs
            .AsNoTracking()
            .CountAsync(a => a.OrganizationId == organizationId && !a.IsDeleted, cancellationToken);

        var sensitiveEntries = await _context.AuditLogs
            .AsNoTracking()
            .CountAsync(a => a.OrganizationId == organizationId && !a.IsDeleted && a.IsSensitive, cancellationToken);

        var todayEntries = await _context.AuditLogs
            .AsNoTracking()
            .CountAsync(a => a.OrganizationId == organizationId && !a.IsDeleted && a.CreatedAt >= todayStart, cancellationToken);

        var byType = await _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.OrganizationId == organizationId && !a.IsDeleted)
            .GroupBy(a => a.Type)
            .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
            .ToDictionaryAsync(x => x.Type, x => x.Count, cancellationToken);

        var byActor = await _context.AuditLogs
            .AsNoTracking()
            .Where(a => a.OrganizationId == organizationId && !a.IsDeleted && a.ActorId.HasValue)
            .GroupBy(a => a.ActorName)
            .Select(g => new { Actor = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(10)
            .ToDictionaryAsync(x => x.Actor, x => x.Count, cancellationToken);

        return new AuditLogStatistics
        {
            TotalEntries = totalEntries,
            SensitiveEntries = sensitiveEntries,
            TodayEntries = todayEntries,
            ByType = byType,
            ByActor = byActor
        };
    }
}