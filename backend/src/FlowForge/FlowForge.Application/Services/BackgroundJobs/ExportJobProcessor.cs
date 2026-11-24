using FlowForge.Application.Interfaces;
using FlowForge.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;

namespace FlowForge.Application.Services.BackgroundJobs;

/// <summary>
/// Represents an export job.
/// </summary>
public sealed record ExportJob
{
    public Guid Id { get; init; }
    public Guid OrganizationId { get; init; }
    public Guid RequestedBy { get; init; }
    public string Format { get; init; } = "csv"; // csv, xlsx, pdf
    public DateTime RequestedAt { get; init; } = DateTime.UtcNow;
    public ExportStatus Status { get; set; } = ExportStatus.Pending;
    public string? FilePath { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime? CompletedAt { get; set; }
}

/// <summary>
/// Export job status.
/// </summary>
public enum ExportStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}

/// <summary>
/// Background job for generating data exports.
/// </summary>
public sealed class ExportJobProcessor
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ExportJobProcessor> _logger;

    public ExportJobProcessor(IServiceScopeFactory scopeFactory, ILogger<ExportJobProcessor> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task ProcessAsync(ExportJob job, CancellationToken cancellationToken = default)
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

        job.Status = ExportStatus.Processing;

        try
        {
            _logger.LogInformation("Starting export job {JobId} for organization {OrgId}", job.Id, job.OrganizationId);

            var filePath = job.Format.ToLower() switch
            {
                "xlsx" => await GenerateExcelExportAsync(context, job.OrganizationId, cancellationToken),
                "csv" => await GenerateCsvExportAsync(context, job.OrganizationId, cancellationToken),
                "pdf" => await GeneratePdfExportAsync(context, job.OrganizationId, cancellationToken),
                _ => throw new InvalidOperationException($"Unsupported export format: {job.Format}")
            };

            job.FilePath = filePath;
            job.Status = ExportStatus.Completed;
            job.CompletedAt = DateTime.UtcNow;

            _logger.LogInformation("Export job {JobId} completed successfully. File: {FilePath}", job.Id, filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Export job {JobId} failed", job.Id);
            job.Status = ExportStatus.Failed;
            job.ErrorMessage = ex.Message;
        }
    }

    private async Task<string> GenerateExcelExportAsync(IApplicationDbContext context, Guid organizationId, CancellationToken cancellationToken)
    {
        // TODO: Implement Excel generation using ClosedXML or EPPlus
        // For now, return a placeholder
        var fileName = $"export_{organizationId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.xlsx";
        var filePath = Path.Combine("Storage", "Exports", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        await File.WriteAllTextAsync(filePath, "Excel export placeholder", cancellationToken);

        return filePath;
    }

    private async Task<string> GenerateCsvExportAsync(IApplicationDbContext context, Guid organizationId, CancellationToken cancellationToken)
    {
        var projects = await context.Projects
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && !p.IsDeleted)
            .ToListAsync(cancellationToken);

        var workItems = await context.WorkItems
            .AsNoTracking()
            .Where(w => w.Column.Board.Project.OrganizationId == organizationId && !w.IsDeleted)
            .ToListAsync(cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Type,Id,Title,Status,Priority,DueDate,Assignee,CreatedAt");

        foreach (var project in projects)
        {
            csv.AppendLine($"Project,{project.Id},{project.Name},{project.IsArchived},,,,,{project.CreatedAt:yyyy-MM-dd}");
        }

        foreach (var item in workItems)
        {
            csv.AppendLine($"WorkItem,{item.Id},{item.Title},{item.Status},{item.Priority},{item.DueDate?.ToString("yyyy-MM-dd") ?? ""},{item.AssigneeId ?? Guid.Empty},{item.CreatedAt:yyyy-MM-dd}");
        }

        var fileName = $"export_{organizationId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.csv";
        var filePath = Path.Combine("Storage", "Exports", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        await File.WriteAllTextAsync(filePath, csv.ToString(), cancellationToken);

        return filePath;
    }

    private async Task<string> GeneratePdfExportAsync(IApplicationDbContext context, Guid organizationId, CancellationToken cancellationToken)
    {
        // TODO: Implement PDF generation using QuestPDF or similar
        var fileName = $"export_{organizationId}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.pdf";
        var filePath = Path.Combine("Storage", "Exports", fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);
        await File.WriteAllTextAsync(filePath, "PDF export placeholder", cancellationToken);

        return filePath;
    }
}