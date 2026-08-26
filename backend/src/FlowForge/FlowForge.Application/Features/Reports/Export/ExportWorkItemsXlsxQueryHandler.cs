using ClosedXML.Excel;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Users;
using FlowForge.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FlowForge.Application.Features.Reports.Export;

public sealed class ExportWorkItemsXlsxQueryHandler
    : IRequestHandler<
        ExportWorkItemsXlsxQuery,
        ExportWorkItemsXlsxResponse>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly IUserService _userService;

    public ExportWorkItemsXlsxQueryHandler(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        IUserService userService)
    {
        _context = context;
        _currentUser = currentUser;
        _userService = userService;
    }

    public async Task<ExportWorkItemsXlsxResponse> Handle(
        ExportWorkItemsXlsxQuery request,
        CancellationToken cancellationToken)
    {
        var organizationId =
            _currentUser.User.OrganizationId;

        var generatedAt =
            DateTime.UtcNow;

        /*
         * -----------------------------------------------------
         * WORK ITEMS
         * -----------------------------------------------------
         */

        var workItems =
            await _context.WorkItems
                .AsNoTracking()
                .Where(x =>
                    !x.IsDeleted &&
                    x.Column.Board.Project.OrganizationId ==
                    organizationId)
                .Select(x => new WorkItemExportRow
                {
                    Id = x.Id,
                    Title = x.Title,
                    Status = x.Status,
                    Priority = x.Priority,
                    AssigneeId = x.AssigneeId,
                    DueDate = x.DueDate,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt,
                    IsArchived = x.IsArchived,

                    ProjectName =
                        x.Column.Board.Project.Name,

                    BoardName =
                        x.Column.Board.Name
                })
                .OrderBy(x => x.ProjectName)
                .ThenBy(x => x.BoardName)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync(cancellationToken);


        /*
         * -----------------------------------------------------
         * USERS
         * -----------------------------------------------------
         */

        var users =
            await _userService.GetByOrganizationAsync(
                organizationId,
                cancellationToken);


        var userLookup =
            users.ToDictionary(
                x => x.Id,
                x => new UserExportInfo
                {
                    FullName =
                        string.IsNullOrWhiteSpace(x.FullName)
                            ? "Unassigned"
                            : x.FullName,

                    Email =
                        x.Email ?? string.Empty
                });


        /*
         * -----------------------------------------------------
         * SUMMARY
         * -----------------------------------------------------
         */

        var total =
            workItems.Count;

        var completed =
            workItems.Count(x =>
                x.Status ==
                WorkItemStatus.Completed);

        var active =
            workItems.Count(x =>
                x.Status ==
                WorkItemStatus.Active);

        var blocked =
            workItems.Count(x =>
                x.Status ==
                WorkItemStatus.Blocked);

        var archived =
            workItems.Count(x =>
                x.IsArchived);

        var assigned =
            workItems.Count(x =>
                x.AssigneeId != null);

        var unassigned =
            workItems.Count(x =>
                x.AssigneeId == null);

        var overdue =
            workItems.Count(x =>
                !x.IsArchived &&
                x.Status !=
                    WorkItemStatus.Completed &&
                x.DueDate.HasValue &&
                x.DueDate.Value <
                    generatedAt);


        var completionPercentage =
            total == 0
                ? 0
                : Math.Round(
                    completed * 100.0 / total,
                    2);


        /*
         * -----------------------------------------------------
         * PROJECT SUMMARY
         * -----------------------------------------------------
         */

        var projectSummary =
            workItems
                .GroupBy(x =>
                    new
                    {
                        x.ProjectName
                    })
                .Select(group =>
                {
                    var groupTotal =
                        group.Count();

                    var groupCompleted =
                        group.Count(x =>
                            x.Status ==
                            WorkItemStatus.Completed);

                    return new ProjectExportRow
                    {
                        ProjectName =
                            group.Key.ProjectName,

                        Total =
                            groupTotal,

                        Active =
                            group.Count(x =>
                                x.Status ==
                                WorkItemStatus.Active),

                        Completed =
                            groupCompleted,

                        Blocked =
                            group.Count(x =>
                                x.Status ==
                                WorkItemStatus.Blocked),

                        Overdue =
                            group.Count(x =>
                                !x.IsArchived &&
                                x.Status !=
                                    WorkItemStatus.Completed &&
                                x.DueDate.HasValue &&
                                x.DueDate.Value <
                                    generatedAt),

                        CompletionPercentage =
                            groupTotal == 0
                                ? 0
                                : Math.Round(
                                    groupCompleted *
                                    100.0 /
                                    groupTotal,
                                    2)
                    };
                })
                .OrderBy(x =>
                    x.ProjectName)
                .ToList();


        /*
         * -----------------------------------------------------
         * TEAM SUMMARY
         * -----------------------------------------------------
         */

        var teamSummary =
            users
                .Select(user =>
                {
                    var assignedItems =
                        workItems
                            .Where(x =>
                                x.AssigneeId ==
                                user.Id)
                            .ToList();

                    return new TeamExportRow
                    {
                        FullName =
                            string.IsNullOrWhiteSpace(
                                user.FullName)
                                ? "Unknown User"
                                : user.FullName,

                        Email =
                            user.Email ?? string.Empty,

                        Assigned =
                            assignedItems.Count,

                        Active =
                            assignedItems.Count(x =>
                                x.Status ==
                                WorkItemStatus.Active),

                        Completed =
                            assignedItems.Count(x =>
                                x.Status ==
                                WorkItemStatus.Completed),

                        Blocked =
                            assignedItems.Count(x =>
                                x.Status ==
                                WorkItemStatus.Blocked),

                        Overdue =
                            assignedItems.Count(x =>
                                !x.IsArchived &&
                                x.Status !=
                                    WorkItemStatus.Completed &&
                                x.DueDate.HasValue &&
                                x.DueDate.Value <
                                    generatedAt)
                    };
                })
                .Where(x =>
                    x.Assigned > 0)
                .OrderByDescending(x =>
                    x.Assigned)
                .ThenBy(x =>
                    x.FullName)
                .ToList();


        /*
         * -----------------------------------------------------
         * LABEL USAGE
         * -----------------------------------------------------
         *
         * This follows the exact same relationship used by
         * GetLabelUsageQueryHandler.
         */

        var labelUsage =
            await _context.Labels
                .AsNoTracking()
                .Where(x =>
                    !x.IsDeleted &&
                    x.OrganizationId ==
                    organizationId)
                .Select(x => new LabelExportRow
                {
                    Name =
                        x.Name,

                    Color =
                        x.Color,

                    UsageCount =
                        x.WorkItemLabels.Count(w =>
                            !w.IsDeleted)
                })
                .OrderByDescending(x =>
                    x.UsageCount)
                .ThenBy(x =>
                    x.Name)
                .ToListAsync(cancellationToken);


        var totalLabelUsage =
            labelUsage.Sum(x =>
                x.UsageCount);


        /*
         * -----------------------------------------------------
         * PRODUCTIVITY
         * -----------------------------------------------------
         *
         * Default report period:
         * Last 30 days.
         *
         * This follows the same calculation used by
         * GetProductivityTrendsQueryHandler.
         */

        const int productivityDays = 30;

        var fromDate =
            generatedAt.Date.AddDays(
                -(productivityDays - 1));


        var productivityItems =
            workItems
                .Where(x =>
                    x.CreatedAt >=
                    fromDate)
                .ToList();


        var productivity =
            Enumerable
                .Range(
                    0,
                    productivityDays)
                .Select(i =>
                {
                    var day =
                        fromDate.AddDays(i)
                            .Date;

                    var created =
                        productivityItems.Count(x =>
                            x.CreatedAt.Date ==
                            day);

                    var completedThatDay =
                        productivityItems.Count(x =>
                            x.Status ==
                                WorkItemStatus.Completed &&
                            x.CreatedAt <=
                                day.AddDays(1).AddTicks(-1));

                    /*
                     * The API's productivity handler defines
                     * completed work using UpdatedAt.
                     *
                     * We do not have a completed-at field in
                     * the current export projection, so the
                     * Work Items sheet remains authoritative.
                     *
                     * For the export trend, calculate the
                     * cumulative completed count as a useful
                     * management view.
                     */

                    var completed =
                        workItems.Count(x =>
                            x.Status ==
                                WorkItemStatus.Completed &&
                            x.UpdatedAt.HasValue &&
                            x.UpdatedAt.Value.Date ==
                                day);

                    return new ProductivityExportRow
                    {
                        Date =
                            DateOnly.FromDateTime(
                                day),

                        Created =
                            created,

                        Completed =
                            completed,

                        Net =
                            created -
                            completed
                    };
                })
                .ToList();


        /*
         * -----------------------------------------------------
         * CREATE WORKBOOK
         * -----------------------------------------------------
         */

        using var workbook =
            new XLWorkbook();


        /*
         * =====================================================
         * EXECUTIVE SUMMARY
         * =====================================================
         */

        var summarySheet =
            workbook.Worksheets.Add(
                "Executive Summary");

        ConfigureWorksheet(
            summarySheet);


        summarySheet
            .Range("B2:H2")
            .Merge();

        summarySheet
            .Cell("B2")
            .Value =
                "FLOWFORGE";


        summarySheet
            .Range("B3:H3")
            .Merge();

        summarySheet
            .Cell("B3")
            .Value =
                "WORK ITEM REPORT";


        summarySheet
            .Range("B5:H5")
            .Merge();

        summarySheet
            .Cell("B5")
            .Value =
                "Organization Work Item Analysis";


        summarySheet
            .Cell("B7")
            .Value =
                "Report Information";


        summarySheet
            .Cell("B8")
            .Value =
                "Generated (UTC)";


        summarySheet
            .Cell("C8")
            .Value =
                generatedAt;


        summarySheet
            .Cell("B9")
            .Value =
                "Productivity Period";


        summarySheet
            .Cell("C9")
            .Value =
                $"{fromDate:dd MMM yyyy} - {generatedAt:dd MMM yyyy}";


        summarySheet
            .Cell("B11")
            .Value =
                "Work Item Overview";


        WriteSummaryMetric(
            summarySheet,
            "B12",
            "Total Work Items",
            total);

        WriteSummaryMetric(
            summarySheet,
            "B13",
            "Completed",
            completed);

        WriteSummaryMetric(
            summarySheet,
            "B14",
            "Active",
            active);

        WriteSummaryMetric(
            summarySheet,
            "B15",
            "Blocked",
            blocked);

        WriteSummaryMetric(
            summarySheet,
            "B16",
            "Archived",
            archived);

        WriteSummaryMetric(
            summarySheet,
            "B17",
            "Assigned",
            assigned);

        WriteSummaryMetric(
            summarySheet,
            "B18",
            "Unassigned",
            unassigned);

        WriteSummaryMetric(
            summarySheet,
            "B19",
            "Overdue",
            overdue);


        summarySheet
            .Cell("E11")
            .Value =
                "Performance";


        summarySheet
            .Cell("E12")
            .Value =
                "Completion Rate";


        summarySheet
            .Cell("F12")
            .Value =
                completionPercentage / 100;

        summarySheet
            .Cell("F12")
            .Style.NumberFormat
            .Format =
                "0.00%";


        summarySheet
            .Cell("E13")
            .Value =
                "Projects";


        summarySheet
            .Cell("F13")
            .Value =
                projectSummary.Count;


        summarySheet
            .Cell("E14")
            .Value =
                "Team Members";


        summarySheet
            .Cell("F14")
            .Value =
                teamSummary.Count;


        summarySheet
            .Cell("E15")
            .Value =
                "Labels";


        summarySheet
            .Cell("F15")
            .Value =
                labelUsage.Count;


        summarySheet
            .Cell("E16")
            .Value =
                "Labels Applied";


        summarySheet
            .Cell("F16")
            .Value =
                totalLabelUsage;


        ApplySummaryFormatting(
            summarySheet);


        /*
         * =====================================================
         * WORK ITEMS
         * =====================================================
         */

        var workItemsSheet =
            workbook.Worksheets.Add(
                "Work Items");

        ConfigureWorksheet(
            workItemsSheet);


        var workItemHeaders =
            new[]
            {
                "#",
                "Work Item",
                "Project",
                "Board",
                "Assignee",
                "Email",
                "Status",
                "Priority",
                "Due Date",
                "Created Date",
                "Archived",
                "Overdue"
            };


        for (
            var i = 0;
            i < workItemHeaders.Length;
            i++)
        {
            workItemsSheet
                .Cell(1, i + 1)
                .Value =
                    workItemHeaders[i];
        }


        var workItemRow =
            2;


        foreach (var item in workItems)
        {
            userLookup.TryGetValue(
                item.AssigneeId ?? Guid.Empty,
                out var assignee);


            var isOverdue =
                !item.IsArchived &&
                item.Status !=
                    WorkItemStatus.Completed &&
                item.DueDate.HasValue &&
                item.DueDate.Value <
                    generatedAt;


            workItemsSheet
                .Cell(workItemRow, 1)
                .Value =
                    workItemRow - 1;


            workItemsSheet
                .Cell(workItemRow, 2)
                .Value =
                    item.Title;


            workItemsSheet
                .Cell(workItemRow, 3)
                .Value =
                    item.ProjectName;


            workItemsSheet
                .Cell(workItemRow, 4)
                .Value =
                    item.BoardName;


            workItemsSheet
                .Cell(workItemRow, 5)
                .Value =
                    assignee?.FullName ??
                    "Unassigned";


            workItemsSheet
                .Cell(workItemRow, 6)
                .Value =
                    assignee?.Email ??
                    string.Empty;


            workItemsSheet
                .Cell(workItemRow, 7)
                .Value =
                    item.Status.ToString();


            workItemsSheet
                .Cell(workItemRow, 8)
                .Value =
                    item.Priority.ToString();


            if (item.DueDate.HasValue)
            {
                workItemsSheet
                    .Cell(workItemRow, 9)
                    .Value =
                        item.DueDate.Value;

                workItemsSheet
                    .Cell(workItemRow, 9)
                    .Style
                    .DateFormat
                    .Format =
                        "dd MMM yyyy";
            }


            workItemsSheet
                .Cell(workItemRow, 10)
                .Value =
                    item.CreatedAt;

            workItemsSheet
                .Cell(workItemRow, 10)
                .Style
                .DateFormat
                .Format =
                    "dd MMM yyyy HH:mm";


            workItemsSheet
                .Cell(workItemRow, 11)
                .Value =
                    item.IsArchived
                        ? "Yes"
                        : "No";


            workItemsSheet
                .Cell(workItemRow, 12)
                .Value =
                    isOverdue
                        ? "Yes"
                        : "No";


            ApplyStatusFormatting(
                workItemsSheet
                    .Cell(workItemRow, 7),
                item.Status);


            ApplyPriorityFormatting(
                workItemsSheet
                    .Cell(workItemRow, 8),
                item.Priority);


            if (isOverdue)
            {
                workItemsSheet
                    .Cell(workItemRow, 12)
                    .Style
                    .Font
                    .Bold =
                    true;
            }


            workItemRow++;
        }


        FormatTable(
            workItemsSheet,
            1,
            1,
            Math.Max(
                workItemRow - 1,
                1),
            workItemHeaders.Length,
            "WorkItemsTable");


        workItemsSheet
            .SheetView
            .FreezeRows(1);


        SetColumnWidths(
            workItemsSheet,
            new Dictionary<int, double>
            {
                [1] = 6,
                [2] = 36,
                [3] = 24,
                [4] = 24,
                [5] = 22,
                [6] = 32,
                [7] = 14,
                [8] = 14,
                [9] = 15,
                [10] = 20,
                [11] = 12,
                [12] = 12
            });


        /*
         * =====================================================
         * PROJECT SUMMARY
         * =====================================================
         */

        var projectSheet =
            workbook.Worksheets.Add(
                "Project Summary");

        ConfigureWorksheet(
            projectSheet);


        var projectHeaders =
            new[]
            {
                "Project",
                "Total",
                "Active",
                "Completed",
                "Blocked",
                "Overdue",
                "Completion %"
            };


        WriteHeaders(
            projectSheet,
            projectHeaders);


        var projectRow =
            2;


        foreach (var project in projectSummary)
        {
            projectSheet
                .Cell(projectRow, 1)
                .Value =
                    project.ProjectName;

            projectSheet
                .Cell(projectRow, 2)
                .Value =
                    project.Total;

            projectSheet
                .Cell(projectRow, 3)
                .Value =
                    project.Active;

            projectSheet
                .Cell(projectRow, 4)
                .Value =
                    project.Completed;

            projectSheet
                .Cell(projectRow, 5)
                .Value =
                    project.Blocked;

            projectSheet
                .Cell(projectRow, 6)
                .Value =
                    project.Overdue;

            projectSheet
                .Cell(projectRow, 7)
                .Value =
                    project.CompletionPercentage / 100;

            projectSheet
                .Cell(projectRow, 7)
                .Style
                .NumberFormat
                .Format =
                    "0.00%";

            projectRow++;
        }


        FormatTable(
            projectSheet,
            1,
            1,
            Math.Max(projectRow - 1, 1),
            projectHeaders.Length,
            "ProjectSummaryTable");


        projectSheet
            .SheetView
            .FreezeRows(1);


        SetColumnWidths(
            projectSheet,
            new Dictionary<int, double>
            {
                [1] = 32,
                [2] = 12,
                [3] = 12,
                [4] = 14,
                [5] = 12,
                [6] = 12,
                [7] = 16
            });


        /*
         * =====================================================
         * TEAM SUMMARY
         * =====================================================
         */

        var teamSheet =
            workbook.Worksheets.Add(
                "Team Summary");

        ConfigureWorksheet(
            teamSheet);


        var teamHeaders =
            new[]
            {
                "Team Member",
                "Email",
                "Assigned",
                "Active",
                "Completed",
                "Blocked",
                "Overdue"
            };


        WriteHeaders(
            teamSheet,
            teamHeaders);


        var teamRow =
            2;


        foreach (var member in teamSummary)
        {
            teamSheet
                .Cell(teamRow, 1)
                .Value =
                    member.FullName;

            teamSheet
                .Cell(teamRow, 2)
                .Value =
                    member.Email;

            teamSheet
                .Cell(teamRow, 3)
                .Value =
                    member.Assigned;

            teamSheet
                .Cell(teamRow, 4)
                .Value =
                    member.Active;

            teamSheet
                .Cell(teamRow, 5)
                .Value =
                    member.Completed;

            teamSheet
                .Cell(teamRow, 6)
                .Value =
                    member.Blocked;

            teamSheet
                .Cell(teamRow, 7)
                .Value =
                    member.Overdue;

            teamRow++;
        }


        FormatTable(
            teamSheet,
            1,
            1,
            Math.Max(teamRow - 1, 1),
            teamHeaders.Length,
            "TeamSummaryTable");


        teamSheet
            .SheetView
            .FreezeRows(1);


        SetColumnWidths(
            teamSheet,
            new Dictionary<int, double>
            {
                [1] = 26,
                [2] = 34,
                [3] = 14,
                [4] = 14,
                [5] = 14,
                [6] = 14,
                [7] = 14
            });


        /*
         * =====================================================
         * PRODUCTIVITY
         * =====================================================
         */

        var productivitySheet =
            workbook.Worksheets.Add(
                "Productivity");

        ConfigureWorksheet(
            productivitySheet);


        var productivityHeaders =
            new[]
            {
                "Date",
                "Created",
                "Completed",
                "Net Change"
            };


        WriteHeaders(
            productivitySheet,
            productivityHeaders);


        var productivityRow =
            2;


        foreach (var day in productivity)
        {
            productivitySheet
                .Cell(productivityRow, 1)
                .Value =
                    day.Date.ToDateTime(
                        TimeOnly.MinValue);

            productivitySheet
                .Cell(productivityRow, 1)
                .Style
                .DateFormat
                .Format =
                    "dd MMM yyyy";


            productivitySheet
                .Cell(productivityRow, 2)
                .Value =
                    day.Created;


            productivitySheet
                .Cell(productivityRow, 3)
                .Value =
                    day.Completed;


            productivitySheet
                .Cell(productivityRow, 4)
                .Value =
                    day.Net;


            productivityRow++;
        }


        FormatTable(
            productivitySheet,
            1,
            1,
            Math.Max(
                productivityRow - 1,
                1),
            productivityHeaders.Length,
            "ProductivityTable");


        productivitySheet
            .SheetView
            .FreezeRows(1);


        SetColumnWidths(
            productivitySheet,
            new Dictionary<int, double>
            {
                [1] = 18,
                [2] = 14,
                [3] = 14,
                [4] = 16
            });


        /*
         * =====================================================
         * LABEL USAGE
         * =====================================================
         */

        var labelSheet =
            workbook.Worksheets.Add(
                "Label Usage");

        ConfigureWorksheet(
            labelSheet);


        var labelHeaders =
            new[]
            {
                "Label",
                "Color",
                "Usage Count",
                "Share %"
            };


        WriteHeaders(
            labelSheet,
            labelHeaders);


        var labelRow =
            2;


        foreach (var label in labelUsage)
        {
            var share =
                totalLabelUsage == 0
                    ? 0
                    : label.UsageCount *
                      100.0 /
                      totalLabelUsage;


            labelSheet
                .Cell(labelRow, 1)
                .Value =
                    label.Name;


            labelSheet
                .Cell(labelRow, 2)
                .Value =
                    label.Color;


            labelSheet
                .Cell(labelRow, 3)
                .Value =
                    label.UsageCount;


            labelSheet
                .Cell(labelRow, 4)
                .Value =
                    share / 100;


            labelSheet
                .Cell(labelRow, 4)
                .Style
                .NumberFormat
                .Format =
                    "0.00%";


            labelRow++;
        }


        FormatTable(
            labelSheet,
            1,
            1,
            Math.Max(
                labelRow - 1,
                1),
            labelHeaders.Length,
            "LabelUsageTable");


        labelSheet
            .SheetView
            .FreezeRows(1);


        SetColumnWidths(
            labelSheet,
            new Dictionary<int, double>
            {
                [1] = 28,
                [2] = 18,
                [3] = 16,
                [4] = 14
            });


        /*
         * =====================================================
         * FINAL WORKBOOK POLISH
         * =====================================================
         */

        foreach (var worksheet in workbook.Worksheets)
        {
            worksheet.PageSetup.PageOrientation = XLPageOrientation.Landscape;

            worksheet
                .PageSetup
                .FitToPages(
                    1,
                    0);

            worksheet
                .PageSetup
                .SetRowsToRepeatAtTop(1, 1);

            worksheet.PageSetup.Margins.Left = 0.25;
            worksheet.PageSetup.Margins.Right = 0.25;
            worksheet.PageSetup.Margins.Top = 0.50;
            worksheet.PageSetup.Margins.Bottom = 0.50;
        }


        /*
         * -----------------------------------------------------
         * SAVE
         * -----------------------------------------------------
         */

        using var stream =
            new MemoryStream();

        workbook.SaveAs(stream);


        return new ExportWorkItemsXlsxResponse
        {
            Content =
                stream.ToArray(),

            FileName =
                $"FlowForge-Work-Item-Report-{generatedAt:yyyyMMdd-HHmmss}.xlsx",

            ContentType =
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };
    }


    /* =========================================================
       INTERNAL MODELS
       ========================================================= */

    private sealed class WorkItemExportRow
    {
        public Guid Id { get; init; }

        public string Title { get; init; } = string.Empty;

        public WorkItemStatus Status { get; init; }

        public WorkItemPriority Priority { get; init; }

        public Guid? AssigneeId { get; init; }

        public DateTime? DueDate { get; init; }

        public DateTime CreatedAt { get; init; }

        public DateTime? UpdatedAt { get; init; }

        public bool IsArchived { get; init; }

        public string ProjectName { get; init; } = string.Empty;

        public string BoardName { get; init; } = string.Empty;
    }


    private sealed class UserExportInfo
    {
        public string FullName { get; init; } = string.Empty;

        public string Email { get; init; } = string.Empty;
    }


    private sealed class ProjectExportRow
    {
        public string ProjectName { get; init; } = string.Empty;

        public int Total { get; init; }

        public int Active { get; init; }

        public int Completed { get; init; }

        public int Blocked { get; init; }

        public int Overdue { get; init; }

        public double CompletionPercentage { get; init; }
    }


    private sealed class TeamExportRow
    {
        public string FullName { get; init; } = string.Empty;

        public string Email { get; init; } = string.Empty;

        public int Assigned { get; init; }

        public int Active { get; init; }

        public int Completed { get; init; }

        public int Blocked { get; init; }

        public int Overdue { get; init; }
    }


    private sealed class LabelExportRow
    {
        public string Name { get; init; } = string.Empty;

        public string Color { get; init; } = string.Empty;

        public int UsageCount { get; init; }
    }


    private sealed class ProductivityExportRow
    {
        public DateOnly Date { get; init; }

        public int Created { get; init; }

        public int Completed { get; init; }

        public int Net { get; init; }
    }


    /* =========================================================
       EXCEL HELPERS
       ========================================================= */

    private static void ConfigureWorksheet(
        IXLWorksheet worksheet)
    {
        worksheet.Style.Font.FontName =
            "Aptos";

        worksheet.Style.Font.FontSize =
            10;

        worksheet.Style.Alignment
            .Vertical =
            XLAlignmentVerticalValues.Center;

        worksheet.ShowGridLines = false;
    }


    private static void WriteHeaders(
        IXLWorksheet worksheet,
        string[] headers)
    {
        for (
            var i = 0;
            i < headers.Length;
            i++)
        {
            worksheet
                .Cell(1, i + 1)
                .Value =
                    headers[i];
        }

        var range =
            worksheet.Range(
                1,
                1,
                1,
                headers.Length);

        range.Style.Font.Bold =
            true;

        range.Style.Font.FontColor =
            XLColor.White;

        range.Style.Fill.BackgroundColor =
            XLColor.FromHtml(
                "#172033");

        range.Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        range.Style.Alignment.Vertical =
            XLAlignmentVerticalValues.Center;

        range.Style.Alignment.WrapText =
            true;

        range.Style.Border.BottomBorder =
            XLBorderStyleValues.Thin;

        range.Style.Border.BottomBorderColor =
            XLColor.FromHtml(
                "#0F172A");

        worksheet.Row(1).Height =
            26;
    }


    private static void FormatTable(
        IXLWorksheet worksheet,
        int firstRow,
        int firstColumn,
        int lastRow,
        int lastColumn,
        string tableName)
    {
        if (lastRow < firstRow)
        {
            return;
        }

        var range =
            worksheet.Range(
                firstRow,
                firstColumn,
                lastRow,
                lastColumn);

        var table =
            range.CreateTable();

        table.Name =
            tableName;

        table.Theme =
            XLTableTheme.TableStyleMedium2;

        range.Style.Alignment
            .Vertical =
            XLAlignmentVerticalValues.Center;

        range.Style.Alignment.WrapText =
            false;
    }


    private static void SetColumnWidths(
        IXLWorksheet worksheet,
        Dictionary<int, double> widths)
    {
        foreach (var item in widths)
        {
            worksheet
                .Column(item.Key)
                .Width =
                item.Value;
        }
    }


    private static void WriteSummaryMetric(
        IXLWorksheet worksheet,
        string cell,
        string label,
        int value)
    {
        var labelCell =
            worksheet.Cell(cell);

        labelCell.Value =
            label;

        var valueCell =
            worksheet.Cell(
                labelCell.Address.RowNumber,
                labelCell.Address.ColumnNumber + 1);

        valueCell.Value =
            value;
    }


    private static void ApplySummaryFormatting(
        IXLWorksheet worksheet)
    {
        worksheet
            .Range("B2:H2")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("B2:H2")
            .Style.Font.FontSize =
            22;

        worksheet
            .Range("B2:H2")
            .Style.Font.FontColor =
            XLColor.White;

        worksheet
            .Range("B2:H2")
            .Style.Fill.BackgroundColor =
            XLColor.FromHtml(
                "#172033");

        worksheet
            .Range("B2:H2")
            .Style.Alignment.Horizontal =
            XLAlignmentHorizontalValues.Center;

        worksheet
            .Range("B3:H3")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("B3:H3")
            .Style.Font.FontSize =
            13;

        worksheet
            .Range("B3:H3")
            .Style.Font.FontColor =
            XLColor.FromHtml(
                "#334155");

        worksheet
            .Range("B5:H5")
            .Style.Font.Italic =
            true;

        worksheet
            .Range("B7:F7")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("B7:F7")
            .Style.Fill.BackgroundColor =
            XLColor.FromHtml(
                "#E2E8F0");

        worksheet
            .Range("B11:F11")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("B11:F11")
            .Style.Fill.BackgroundColor =
            XLColor.FromHtml(
                "#E2E8F0");

        worksheet
            .Range("B12:C19")
            .Style.Border.OutsideBorder =
            XLBorderStyleValues.Thin;

        worksheet
            .Range("B12:C19")
            .Style.Border.InsideBorder =
            XLBorderStyleValues.Thin;

        worksheet
            .Range("E12:F16")
            .Style.Border.OutsideBorder =
            XLBorderStyleValues.Thin;

        worksheet
            .Range("E12:F16")
            .Style.Border.InsideBorder =
            XLBorderStyleValues.Thin;

        worksheet
            .Range("C12:C19")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("F12:F16")
            .Style.Font.Bold =
            true;

        worksheet
            .Range("B2:H19")
            .Style.Alignment
            .Vertical =
            XLAlignmentVerticalValues.Center;

        worksheet.Column("B").Width =
            24;

        worksheet.Column("C").Width =
            24;

        worksheet.Column("D").Width =
            4;

        worksheet.Column("E").Width =
            24;

        worksheet.Column("F").Width =
            20;

        worksheet.Column("G").Width =
            14;

        worksheet.Column("H").Width =
            14;
    }


    private static void ApplyStatusFormatting(
        IXLCell cell,
        WorkItemStatus status)
    {
        switch (status)
        {
            case WorkItemStatus.Completed:

                cell.Style.Fill.BackgroundColor =
                    XLColor.FromHtml(
                        "#DCFCE7");

                cell.Style.Font.FontColor =
                    XLColor.FromHtml(
                        "#166534");

                break;


            case WorkItemStatus.Active:

                cell.Style.Fill.BackgroundColor =
                    XLColor.FromHtml(
                        "#DBEAFE");

                cell.Style.Font.FontColor =
                    XLColor.FromHtml(
                        "#1D4ED8");

                break;


            case WorkItemStatus.Blocked:

                cell.Style.Fill.BackgroundColor =
                    XLColor.FromHtml(
                        "#FEE2E2");

                cell.Style.Font.FontColor =
                    XLColor.FromHtml(
                        "#B91C1C");

                break;
        }
    }


    private static void ApplyPriorityFormatting(
        IXLCell cell,
        object priority)
    {
        var value =
            priority?.ToString() ??
            string.Empty;

        if (
            value.Equals(
                "High",
                StringComparison.OrdinalIgnoreCase) ||
            value.Equals(
                "Critical",
                StringComparison.OrdinalIgnoreCase))
        {
            cell.Style.Fill.BackgroundColor =
                XLColor.FromHtml(
                    "#FEF3C7");

            cell.Style.Font.FontColor =
                XLColor.FromHtml(
                    "#92400E");

            cell.Style.Font.Bold =
                true;
        }
    }
}