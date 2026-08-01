using System.Text;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.Export;

public sealed class ExportWorkItemsCsvQueryHandler : IRequestHandler<ExportWorkItemsCsvQuery, ExportWorkItemsCsvResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public ExportWorkItemsCsvQueryHandler(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<ExportWorkItemsCsvResponse> Handle(ExportWorkItemsCsvQuery request, CancellationToken cancellationToken)
    {
        var organizationId = _currentUser.User.OrganizationId;

        var workItems = await _context.WorkItems
            .AsNoTracking()
            .Where(x =>
                !x.IsDeleted &&
                x.Column.Board.Project.OrganizationId == organizationId)
            .Select(x => new
            {
                x.Title,
                x.Status,
                x.Priority,
                x.AssigneeId,
                x.DueDate,
                x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var builder = new StringBuilder();

        builder.AppendLine("Title,Status,Priority,AssigneeId,DueDate,CreatedAt");

        foreach (var item in workItems)
        {
            builder.AppendLine(
                $"{Escape(item.Title)}," +
                $"{item.Status}," +
                $"{item.Priority}," +
                $"{item.AssigneeId}," +
                $"{item.DueDate}," +
                $"{item.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return new ExportWorkItemsCsvResponse
        {
            Content = Encoding.UTF8.GetBytes(builder.ToString()),
            FileName = $"work-items-{DateTime.UtcNow:yyyyMMddHHmmss}.csv"
        };
    }

    private static string Escape(string value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        value = value.Replace("\"", "\"\"");

        if (value.Contains(',') ||
            value.Contains('"') ||
            value.Contains('\n'))
        {
            value = $"\"{value}\"";
        }

        return value;
    }
}