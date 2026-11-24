using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.AuditLogs.GetAuditLogs;

/// <summary>
/// Handles <see cref="GetAuditLogsRequest"/>.
/// </summary>
public sealed class GetAuditLogsHandler : IRequestHandler<GetAuditLogsRequest, PagedResult<GetAuditLogsResponse>>
{
    private readonly IApplicationDbContext _context;

    public GetAuditLogsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<GetAuditLogsResponse>> Handle(GetAuditLogsRequest request, CancellationToken cancellationToken)
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

        var totalCount = await query.CountAsync(cancellationToken);

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
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}