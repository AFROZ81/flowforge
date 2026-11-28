using System.Text.Json;

using FlowForge.API.Controllers;
using FlowForge.Api.Controllers;
using FlowForge.Application.Common.Exceptions;
using FlowForge.Application.Features.Authentication.CurrentUser;
using FlowForge.Application.Features.AuditLogs.GetAuditLogs;
using FlowForge.Application.Features.Boards;
using FlowForge.Application.Features.Boards.Create;
using FlowForge.Application.Features.Boards.Delete;
using FlowForge.Application.Features.Boards.GetBoards;
using FlowForge.Application.Features.Boards.Restore;
using FlowForge.Application.Features.Boards.Update;
using FlowForge.Application.Features.Columns;
using FlowForge.Application.Features.Projects;
using FlowForge.Application.Features.Projects.Create;
using FlowForge.Application.Features.Projects.Delete;
using FlowForge.Application.Features.Projects.GetAll;
using FlowForge.Application.Features.Projects.Restore;
using FlowForge.Application.Features.Projects.Update;
using FlowForge.Application.Features.Reminders;
using FlowForge.Application.Features.Reminders.Remove;
using FlowForge.Application.Features.Reminders.Set;
using FlowForge.Application.Features.WorkItems;
using FlowForge.Application.Features.WorkItems.Delete;
using FlowForge.Application.Features.WorkItems.Restore;
using FlowForge.Application.Interfaces;
using FlowForge.Application.Services.AuditLogs;
using FlowForge.Application.Services.Authentication;
using FlowForge.Application.Services.Presence;
using FlowForge.Application.Services.Realtime;
using FlowForge.Domain.Common.Enums;
using FlowForge.Domain.Entities;
using FlowForge.Domain.Enums;
using FlowForge.Domain.Events;
using FlowForge.Infrastructure.Identity;
using FlowForge.Infrastructure.Persistence;
using FlowForge.Infrastructure.Services.WorkItemHistories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FlowForge.Tests;

public sealed class SoftDeleteAccessTests
{
    [Fact]
    public void StructuralAndDeleteEndpointsRequireAdminPolicy()
    {
        AssertPolicy(typeof(WorkItemsController), "Rename", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Edit", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Assign", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Unassign", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Archive", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Restore", "RequireAdmin");
        AssertPolicy(typeof(WorkItemsController), "Delete", "RequireAdmin");

        AssertPolicy(typeof(RemindersController), "SetReminder", "RequireViewer");
        AssertPolicy(typeof(RemindersController), "RemoveReminder", "RequireViewer");

        AssertPolicy(typeof(ProjectsController), "Create", "RequireAdmin");
        AssertPolicy(typeof(ProjectsController), "Update", "RequireAdmin");
        AssertPolicy(typeof(ProjectsController), "Archive", "RequireAdmin");
        AssertPolicy(typeof(ProjectsController), "Restore", "RequireAdmin");
        AssertPolicy(typeof(ProjectsController), "Delete", "RequireAdmin");

        AssertPolicy(typeof(BoardsController), "Create", "RequireAdmin");
        AssertPolicy(typeof(BoardsController), "Update", "RequireAdmin");
        AssertPolicy(typeof(BoardsController), "Archive", "RequireAdmin");
        AssertPolicy(typeof(BoardsController), "Restore", "RequireAdmin");
        AssertPolicy(typeof(BoardsController), "Delete", "RequireAdmin");

        AssertPolicy(typeof(ColumnsController), "Archive", "RequireAdmin");
        AssertPolicy(typeof(ColumnsController), "Restore", "RequireAdmin");
    }

    [Fact]
    public void WorkItemMutationsRequireMemberOrAdminPolicies()
    {
        foreach (var method in new[]
        {
            "Create", "Move", "Complete", "Block", "Activate"
        })
        {
            AssertPolicy(typeof(WorkItemsController), method, "RequireMember");
        }

        AssertPolicy(typeof(ColumnsController), "Create", "RequireMember");
        AssertPolicy(typeof(ColumnsController), "Update", "RequireMember");
        AssertPolicy(typeof(AttachmentsController), "Upload", "RequireMember");
        AssertPolicy(typeof(AttachmentsController), "Delete", "RequireMember");
        AssertPolicy(typeof(CommentsController), "Create", "RequireMember");
        AssertPolicy(typeof(CommentsController), "Update", "RequireMember");
        AssertPolicy(typeof(CommentsController), "Delete", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Create", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Update", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Complete", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Uncomplete", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Delete", "RequireMember");
        AssertPolicy(typeof(ChecklistsController), "Reorder", "RequireMember");
        AssertPolicy(typeof(WorkItemWatchersController), "Create", "RequireMember");
        AssertPolicy(typeof(WorkItemWatchersController), "Delete", "RequireMember");
        AssertPolicy(typeof(LabelsController), "Create", "RequireMember");
        AssertPolicy(typeof(LabelsController), "Update", "RequireMember");
        AssertPolicy(typeof(LabelsController), "Delete", "RequireMember");
        AssertPolicy(typeof(LabelsController), "Assign", "RequireMember");
        AssertPolicy(typeof(LabelsController), "Remove", "RequireMember");
    }

    [Theory]
    [InlineData(UserRole.Admin)]
    [InlineData(UserRole.Member)]
    [InlineData(UserRole.Viewer)]
    public async Task EveryRoleCanManageRemindersOnActiveWorkItems(UserRole role)
    {
        await using var fixture = await CreateFixtureAsync(role);
        var dueDate = DateTime.UtcNow.AddDays(2);
        var reminderDate = DateTime.UtcNow.AddDays(1);
        fixture.WorkItem.Edit(null, WorkItemPriority.Medium, dueDate);
        await fixture.Db.SaveChangesAsync();

        var rules = new ReminderRules(fixture.Db);
        var historyService = new WorkItemHistoryService(fixture.Db);
        var setHandler = new SetReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        var setResult = await setHandler.Handle(
            new SetReminderCommand
            {
                WorkItemId = fixture.WorkItem.Id,
                ReminderDate = reminderDate,
            },
            CancellationToken.None);

        Assert.True(setResult.Success);
        Assert.Equal(reminderDate, fixture.WorkItem.ReminderDate);
        Assert.Equal(dueDate, fixture.WorkItem.DueDate);

        var removeHandler = new RemoveReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        var removeResult = await removeHandler.Handle(
            new RemoveReminderCommand { WorkItemId = fixture.WorkItem.Id },
            CancellationToken.None);

        Assert.True(removeResult.Success);
        Assert.Null(fixture.WorkItem.ReminderDate);
        Assert.Equal(dueDate, fixture.WorkItem.DueDate);

        var histories = await fixture.Db.WorkItemHistories.ToListAsync();
        Assert.Contains(histories, x => x.Action == WorkItemHistoryAction.ReminderUpdated);
        Assert.Contains(histories, x => x.Action == WorkItemHistoryAction.ReminderRemoved);
    }

    [Theory]
    [InlineData(WorkItemStatus.Completed)]
    [InlineData(WorkItemStatus.Blocked)]
    public async Task ReminderHandlersRejectNonActiveWorkItems(WorkItemStatus status)
    {
        await using var fixture = await CreateFixtureAsync(UserRole.Member);
        var dueDate = DateTime.UtcNow.AddDays(2);
        var reminderDate = DateTime.UtcNow.AddDays(1);
        fixture.WorkItem.Edit(null, WorkItemPriority.Medium, dueDate);
        fixture.WorkItem.SetReminder(reminderDate);

        if (status == WorkItemStatus.Completed)
            fixture.WorkItem.MarkCompleted();
        else
            fixture.WorkItem.MarkBlocked();

        await fixture.Db.SaveChangesAsync();

        var rules = new ReminderRules(fixture.Db);
        var historyService = new WorkItemHistoryService(fixture.Db);
        var setHandler = new SetReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        var setException = await Assert.ThrowsAsync<BadRequestException>(() =>
            setHandler.Handle(
                new SetReminderCommand
                {
                    WorkItemId = fixture.WorkItem.Id,
                    ReminderDate = DateTime.UtcNow.AddHours(1),
                },
                CancellationToken.None));
        Assert.Contains("active work items", setException.Message);

        var removeHandler = new RemoveReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        var removeException = await Assert.ThrowsAsync<BadRequestException>(() =>
            removeHandler.Handle(
                new RemoveReminderCommand { WorkItemId = fixture.WorkItem.Id },
                CancellationToken.None));
        Assert.Contains("active work items", removeException.Message);

        Assert.Equal(reminderDate, fixture.WorkItem.ReminderDate);
        Assert.Equal(dueDate, fixture.WorkItem.DueDate);
        Assert.Empty(await fixture.Db.WorkItemHistories.ToListAsync());
    }

    [Fact]
    public async Task ReminderHandlersRejectArchivedWorkItems()
    {
        await using var fixture = await CreateFixtureAsync(UserRole.Viewer);
        var reminderDate = DateTime.UtcNow.AddDays(1);
        fixture.WorkItem.SetReminder(reminderDate);
        fixture.WorkItem.Archive();
        await fixture.Db.SaveChangesAsync();

        var rules = new ReminderRules(fixture.Db);
        var historyService = new WorkItemHistoryService(fixture.Db);
        var setHandler = new SetReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        await Assert.ThrowsAsync<BadRequestException>(() =>
            setHandler.Handle(
                new SetReminderCommand
                {
                    WorkItemId = fixture.WorkItem.Id,
                    ReminderDate = DateTime.UtcNow.AddHours(1),
                },
                CancellationToken.None));

        var removeHandler = new RemoveReminderCommandHandler(rules, fixture.CurrentUser, historyService);
        await Assert.ThrowsAsync<BadRequestException>(() =>
            removeHandler.Handle(
                new RemoveReminderCommand { WorkItemId = fixture.WorkItem.Id },
                CancellationToken.None));

        Assert.Equal(reminderDate, fixture.WorkItem.ReminderDate);
        Assert.Empty(await fixture.Db.WorkItemHistories.ToListAsync());
    }

    [Fact]
    public async Task WorkItemDeleteSoftDeletesAllDependentsAndWritesAudit()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        var workItem = fixture.WorkItem;
        var label = new Label(fixture.OrganizationId, "Bug", "#EF4444", null);
        fixture.Db.Labels.Add(label);
        fixture.Db.Attachments.Add(new Attachment(
            workItem.Id,
            fixture.UserId,
            "requirements.txt",
            "stored-requirements.txt",
            "text/plain",
            10,
            "attachments/requirements.txt"));
        fixture.Db.Comments.Add(new Comment(workItem.Id, fixture.UserId, "Dependent comment"));
        fixture.Db.WorkItemLabels.Add(new WorkItemLabel(workItem.Id, label.Id));
        fixture.Db.Notifications.Add(new Notification(
            fixture.OrganizationId,
            fixture.UserId,
            NotificationType.WorkItemStatusChanged,
            "Status changed",
            "Dependent notification",
            workItem.Id));
        fixture.Db.WorkItemWatchers.Add(new WorkItemWatcher(workItem.Id, fixture.UserId));
        fixture.Db.ChecklistItems.Add(new ChecklistItem(workItem.Id, "Dependent checklist item", 1));
        fixture.Db.WorkItemHistories.Add(new WorkItemHistory(
            workItem.Id,
            fixture.UserId,
            WorkItemHistoryAction.Created,
            "Dependent history"));
        await fixture.Db.SaveChangesAsync();

        var handler = new DeleteWorkItemCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteWorkItemCommandHandler>.Instance);

        await handler.Handle(new DeleteWorkItemCommand { WorkItemId = workItem.Id }, CancellationToken.None);

        Assert.False(await fixture.Db.WorkItems.AnyAsync(x => x.Id == workItem.Id));
        Assert.False(await fixture.Db.Attachments.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.Comments.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.WorkItemLabels.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.Notifications.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.WorkItemWatchers.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.ChecklistItems.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.False(await fixture.Db.WorkItemHistories.AnyAsync(x => x.WorkItemId == workItem.Id));

        var storedWorkItem = await fixture.Db.WorkItems.IgnoreQueryFilters().SingleAsync(x => x.Id == workItem.Id);
        Assert.True(storedWorkItem.IsDeleted);
        Assert.NotNull(storedWorkItem.DeletedAt);
        Assert.True(await fixture.Db.Attachments.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.Comments.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.WorkItemLabels.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.Notifications.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.WorkItemWatchers.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.ChecklistItems.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.True(await fixture.Db.WorkItemHistories.IgnoreQueryFilters().AnyAsync(x => x.WorkItemId == workItem.Id && x.IsDeleted));
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.WorkItemDeleted && x.IsSensitive);
        Assert.Contains(fixture.Realtime.BoardEvents, x => x.EventName == "WorkItemDeleted");
    }

    [Theory]
    [InlineData(UserRole.Member)]
    [InlineData(UserRole.Viewer)]
    public async Task WorkItemDeleteRejectsNonAdminBeforeMutation(UserRole role)
    {
        var fixture = await CreateFixtureAsync(role);
        var handler = new DeleteWorkItemCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteWorkItemCommandHandler>.Instance);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            handler.Handle(new DeleteWorkItemCommand { WorkItemId = fixture.WorkItem.Id }, CancellationToken.None));

        Assert.True(await fixture.Db.WorkItems.AnyAsync(x => x.Id == fixture.WorkItem.Id));
    }

    [Fact]
    public async Task EmptyProjectCanBeSoftDeleted()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        fixture.WorkItem.Delete();
        fixture.Column.Delete();
        fixture.Board.Delete();
        await fixture.Db.SaveChangesAsync();

        var handler = new DeleteProjectHandler(
            fixture.Db,
            fixture.CurrentUser,
            new ProjectRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteProjectHandler>.Instance);

        await handler.Handle(new DeleteProjectCommand { ProjectId = fixture.Project.Id }, CancellationToken.None);

        Assert.False(await fixture.Db.Projects.AnyAsync(x => x.Id == fixture.Project.Id));
        var storedProject = await fixture.Db.Projects.IgnoreQueryFilters().SingleAsync(x => x.Id == fixture.Project.Id);
        Assert.True(storedProject.IsDeleted);
        Assert.NotNull(storedProject.DeletedAt);
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.ProjectDeleted && x.IsSensitive);
        Assert.Contains(fixture.Realtime.OrganizationEvents, x => x.EventName == "ProjectDeleted");
    }

    [Fact]
    public async Task ProjectWithActiveBoardsCannotBeDeleted()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        var handler = new DeleteProjectHandler(
            fixture.Db,
            fixture.CurrentUser,
            new ProjectRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteProjectHandler>.Instance);

        var conflict = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new DeleteProjectCommand { ProjectId = fixture.Project.Id }, CancellationToken.None));
        Assert.Contains("1 active board", conflict.Message);

        Assert.True(await fixture.Db.Projects.AnyAsync(x => x.Id == fixture.Project.Id));
    }

    [Fact]
    public async Task EmptyBoardCanBeSoftDeleted()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        fixture.WorkItem.Delete();
        fixture.Column.Delete();
        await fixture.Db.SaveChangesAsync();

        var handler = new DeleteBoardHandler(
            fixture.Db,
            fixture.CurrentUser,
            new BoardRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteBoardHandler>.Instance);

        await handler.Handle(new DeleteBoardCommand { BoardId = fixture.Board.Id }, CancellationToken.None);

        Assert.False(await fixture.Db.Boards.AnyAsync(x => x.Id == fixture.Board.Id));
        var storedBoard = await fixture.Db.Boards.IgnoreQueryFilters().SingleAsync(x => x.Id == fixture.Board.Id);
        Assert.True(storedBoard.IsDeleted);
        Assert.NotNull(storedBoard.DeletedAt);
        Assert.Contains(fixture.Audit.Entries, x => x.Type == AuditLogType.BoardDeleted && x.IsSensitive);
        Assert.Contains(fixture.Realtime.BoardEvents, x => x.EventName == "BoardDeleted");
    }

    [Fact]
    public async Task BoardWithActiveColumnsCannotBeDeleted()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        var handler = new DeleteBoardHandler(
            fixture.Db,
            fixture.CurrentUser,
            new BoardRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteBoardHandler>.Instance);

        var conflict = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new DeleteBoardCommand { BoardId = fixture.Board.Id }, CancellationToken.None));
        Assert.Contains("1 active column", conflict.Message);

        Assert.True(await fixture.Db.Boards.AnyAsync(x => x.Id == fixture.Board.Id));
    }

    [Theory]
    [InlineData(UserRole.Member)]
    [InlineData(UserRole.Viewer)]
    public async Task StructuralHandlersRejectNonAdmins(UserRole role)
    {
        var fixture = await CreateFixtureAsync(role);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new CreateProjectCommandHandler(fixture.Db, fixture.CurrentUser).Handle(
                new CreateProjectCommand("Blocked", "BLK", null, "#2563EB", null),
                CancellationToken.None));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new UpdateProjectHandler(fixture.Db, fixture.CurrentUser, new ProjectRules(fixture.Db)).Handle(
                new UpdateProjectCommand(fixture.Project.Id, "Blocked", "TST", null, "#2563EB", "test-icon"),
                CancellationToken.None));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new DeleteProjectHandler(
                fixture.Db,
                fixture.CurrentUser,
                new ProjectRules(fixture.Db),
                fixture.Audit,
                fixture.Realtime,
                NullLogger<DeleteProjectHandler>.Instance).Handle(
                    new DeleteProjectCommand { ProjectId = fixture.Project.Id },
                    CancellationToken.None));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new CreateBoardCommandHandler(fixture.Db, fixture.CurrentUser, new BoardRules(fixture.Db)).Handle(
                new CreateBoardCommand { ProjectId = fixture.Project.Id, Name = "Blocked" },
                CancellationToken.None));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new UpdateBoardHandler(fixture.Db, fixture.CurrentUser, new BoardRules(fixture.Db)).Handle(
                new UpdateBoardCommand { BoardId = fixture.Board.Id, Name = "Blocked" },
                CancellationToken.None));

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            new DeleteBoardHandler(
                fixture.Db,
                fixture.CurrentUser,
                new BoardRules(fixture.Db),
                fixture.Audit,
                fixture.Realtime,
                NullLogger<DeleteBoardHandler>.Instance).Handle(
                    new DeleteBoardCommand { BoardId = fixture.Board.Id },
                    CancellationToken.None));

        Assert.Equal("Test Project", fixture.Project.Name);
        Assert.Equal("Test Board", fixture.Board.Name);
        Assert.Single(fixture.Db.Projects);
        Assert.Single(fixture.Db.Boards);
    }

    [Fact]
    public async Task SoftDeletesCannotCrossOrganizationBoundaries()
    {
        var fixture = await CreateFixtureAsync(UserRole.Admin);
        var foreignOrganizationId = Guid.NewGuid();
        fixture.Db.Organizations.Add(new Organization
        {
            Id = foreignOrganizationId,
            Name = "Foreign Org",
            Slug = "foreign-org"
        });
        var foreignProject = new Project(foreignOrganizationId, "Foreign Project", "FRN", null, "#2563EB", null);
        fixture.Db.Projects.Add(foreignProject);
        await fixture.Db.SaveChangesAsync();
        var foreignBoard = new Board(foreignProject.Id, "Foreign Board", null);
        fixture.Db.Boards.Add(foreignBoard);
        await fixture.Db.SaveChangesAsync();
        var foreignColumn = new Column(foreignBoard.Id, "Foreign Column", null, 1);
        fixture.Db.Columns.Add(foreignColumn);
        await fixture.Db.SaveChangesAsync();
        var foreignWorkItem = new WorkItem(
            foreignColumn.Id,
            "Foreign work item",
            null,
            WorkItemPriority.Medium,
            null,
            1000);
        fixture.Db.WorkItems.Add(foreignWorkItem);
        await fixture.Db.SaveChangesAsync();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeleteWorkItemCommandHandler(
                fixture.Db,
                fixture.CurrentUser,
                new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
                fixture.Audit,
                fixture.Realtime,
                NullLogger<DeleteWorkItemCommandHandler>.Instance).Handle(
                    new DeleteWorkItemCommand { WorkItemId = foreignWorkItem.Id },
                    CancellationToken.None));

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeleteProjectHandler(
                fixture.Db,
                fixture.CurrentUser,
                new ProjectRules(fixture.Db),
                fixture.Audit,
                fixture.Realtime,
                NullLogger<DeleteProjectHandler>.Instance).Handle(
                    new DeleteProjectCommand { ProjectId = foreignProject.Id },
                    CancellationToken.None));

        await Assert.ThrowsAsync<NotFoundException>(() =>
            new DeleteBoardHandler(
                fixture.Db,
                fixture.CurrentUser,
                new BoardRules(fixture.Db),
                fixture.Audit,
                fixture.Realtime,
                NullLogger<DeleteBoardHandler>.Instance).Handle(
                    new DeleteBoardCommand { BoardId = foreignBoard.Id },
                    CancellationToken.None));

        Assert.True(await fixture.Db.WorkItems.AnyAsync(x => x.Id == foreignWorkItem.Id));
        Assert.True(await fixture.Db.Projects.AnyAsync(x => x.Id == foreignProject.Id));
        Assert.True(await fixture.Db.Boards.AnyAsync(x => x.Id == foreignBoard.Id));
        Assert.Empty(fixture.Audit.Entries);
    }

    [Fact]
    public async Task FailedAuditRollsBackWorkItemAndDependentDeletes()
    {
        await using var fixture = await CreateFixtureAsync(
            UserRole.Admin,
            useSqlite: true,
            auditFailure: new InvalidOperationException("Audit failed."));
        var workItem = fixture.WorkItem;
        fixture.Db.Attachments.Add(new Attachment(
            workItem.Id,
            fixture.UserId,
            "requirements.txt",
            "stored-requirements.txt",
            "text/plain",
            10,
            "attachments/requirements.txt"));
        await fixture.Db.SaveChangesAsync();

        var handler = new DeleteWorkItemCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteWorkItemCommandHandler>.Instance);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            handler.Handle(new DeleteWorkItemCommand { WorkItemId = workItem.Id }, CancellationToken.None));

        fixture.Db.ChangeTracker.Clear();
        Assert.True(await fixture.Db.WorkItems.AnyAsync(x => x.Id == workItem.Id));
        Assert.True(await fixture.Db.Attachments.AnyAsync(x => x.WorkItemId == workItem.Id));
        Assert.Empty(fixture.Realtime.BoardEvents);
    }

    [Fact]
    public async Task SoftDeletedWorkItemAndDependentsCanBeRestored()
    {
        await using var fixture = await CreateFixtureAsync(UserRole.Admin);
        fixture.Db.Attachments.Add(new Attachment(
            fixture.WorkItem.Id,
            fixture.UserId,
            "requirements.txt",
            "stored-requirements.txt",
            "text/plain",
            10,
            "attachments/requirements.txt"));
        await fixture.Db.SaveChangesAsync();

        var deleteHandler = new DeleteWorkItemCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteWorkItemCommandHandler>.Instance);
        await deleteHandler.Handle(new DeleteWorkItemCommand { WorkItemId = fixture.WorkItem.Id }, CancellationToken.None);

        var restoreHandler = new RestoreWorkItemCommandHandler(
            fixture.Db,
            fixture.CurrentUser,
            new WorkItemRules(fixture.Db, new ColumnRules(fixture.Db)),
            fixture.Realtime);
        await restoreHandler.Handle(new RestoreWorkItemCommand { WorkItemId = fixture.WorkItem.Id }, CancellationToken.None);

        var restoredWorkItem = await fixture.Db.WorkItems.SingleAsync(x => x.Id == fixture.WorkItem.Id);
        Assert.False(restoredWorkItem.IsDeleted);
        Assert.Null(restoredWorkItem.DeletedAt);
        Assert.True(await fixture.Db.Attachments.AnyAsync(x => x.WorkItemId == fixture.WorkItem.Id && !x.IsDeleted));
    }

    [Fact]
    public async Task SoftDeletedProjectCanBeRestored()
    {
        await using var fixture = await CreateFixtureAsync(UserRole.Admin);
        fixture.WorkItem.Delete();
        fixture.Column.Delete();
        fixture.Board.Delete();
        await fixture.Db.SaveChangesAsync();

        var deleteHandler = new DeleteProjectHandler(
            fixture.Db,
            fixture.CurrentUser,
            new ProjectRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteProjectHandler>.Instance);
        await deleteHandler.Handle(new DeleteProjectCommand { ProjectId = fixture.Project.Id }, CancellationToken.None);

        var restoreHandler = new RestoreProjectHandler(
            fixture.Db,
            fixture.CurrentUser,
            new ProjectRules(fixture.Db));
        await restoreHandler.Handle(new RestoreProjectCommand { ProjectId = fixture.Project.Id }, CancellationToken.None);

        var restoredProject = await fixture.Db.Projects.SingleAsync(x => x.Id == fixture.Project.Id);
        Assert.False(restoredProject.IsDeleted);
        Assert.Null(restoredProject.DeletedAt);
    }

    [Fact]
    public async Task SoftDeletedBoardCanBeRestored()
    {
        await using var fixture = await CreateFixtureAsync(UserRole.Admin);
        fixture.WorkItem.Delete();
        fixture.Column.Delete();
        await fixture.Db.SaveChangesAsync();

        var deleteHandler = new DeleteBoardHandler(
            fixture.Db,
            fixture.CurrentUser,
            new BoardRules(fixture.Db),
            fixture.Audit,
            fixture.Realtime,
            NullLogger<DeleteBoardHandler>.Instance);
        await deleteHandler.Handle(new DeleteBoardCommand { BoardId = fixture.Board.Id }, CancellationToken.None);

        var restoreHandler = new RestoreBoardHandler(
            fixture.Db,
            fixture.CurrentUser,
            new BoardRules(fixture.Db));
        await restoreHandler.Handle(new RestoreBoardCommand { BoardId = fixture.Board.Id }, CancellationToken.None);

        var restoredBoard = await fixture.Db.Boards.SingleAsync(x => x.Id == fixture.Board.Id);
        Assert.False(restoredBoard.IsDeleted);
        Assert.Null(restoredBoard.DeletedAt);
    }

    [Theory]
    [InlineData(UserRole.Admin, true)]
    [InlineData(UserRole.Member, false)]
    [InlineData(UserRole.Viewer, false)]
    public async Task ProjectListIncludesArchivedOnlyForAdmins(UserRole role, bool includesArchived)
    {
        await using var fixture = await CreateFixtureAsync(role);
        fixture.Project.Archive();
        await fixture.Db.SaveChangesAsync();

        var handler = new GetProjectsQueryHandler(fixture.Db, fixture.CurrentUser);
        var result = await handler.Handle(new GetProjectsQuery(), CancellationToken.None);

        if (includesArchived)
        {
            var project = Assert.Single(result.Data!.Items);
            Assert.True(project.Archived);
        }
        else
        {
            Assert.Empty(result.Data!.Items);
        }
    }

    [Theory]
    [InlineData(UserRole.Admin, true)]
    [InlineData(UserRole.Member, false)]
    [InlineData(UserRole.Viewer, false)]
    public async Task BoardListIncludesArchivedOnlyForAdmins(UserRole role, bool includesArchived)
    {
        await using var fixture = await CreateFixtureAsync(role);
        fixture.Board.Archive();
        await fixture.Db.SaveChangesAsync();

        var handler = new GetBoardsHandler(fixture.Db, fixture.CurrentUser, new BoardRules(fixture.Db));
        var result = await handler.Handle(
            new GetBoardsQuery
            {
                ProjectId = fixture.Project.Id,
                IncludeArchived = true,
            },
            CancellationToken.None);

        if (includesArchived)
        {
            var board = Assert.Single(result.Data!.Items);
            Assert.True(board.IsArchived);
        }
        else
        {
            Assert.Empty(result.Data!.Items);
        }
    }

    [Theory]
    [InlineData(UserRole.Admin)]
    [InlineData(UserRole.Member)]
    [InlineData(UserRole.Viewer)]
    public async Task OnlineUsersIncludeEveryOrganizationRole(UserRole role)
    {
        await using var fixture = await CreateFixtureAsync(role);

        // Reproduce the multi-organization case: the legacy user organization id
        // is not authoritative, while the membership row is the source of truth.
        var user = await fixture.Db.Users.SingleAsync(x => x.Id == fixture.UserId);
        user.OrganizationId = Guid.Empty;
        fixture.Db.OrganizationUsers.Add(new OrganizationUser
        {
            UserId = fixture.UserId,
            OrganizationId = fixture.OrganizationId,
            Role = role,
        });
        await fixture.Db.SaveChangesAsync();

        var controller = new PresenceController(
            new FakeOnlineUserTracker(fixture.UserId),
            fixture.Db,
            fixture.CurrentUser);

        var result = await controller.GetOnlineUsers(CancellationToken.None);
        var ok = Assert.IsType<OkObjectResult>(result);
        var json = JsonSerializer.Serialize(ok.Value);

        Assert.Contains($"\"userId\":\"{fixture.UserId}\"", json);
        Assert.Contains("Test Admin", json);
    }

    private static void AssertPolicy(Type controllerType, string methodName, string policy)
    {
        var method = controllerType.GetMethod(methodName)
            ?? throw new InvalidOperationException($"{controllerType.Name}.{methodName} was not found.");
        var attribute = method.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>()
            .SingleOrDefault(x => x.Policy == policy);

        Assert.NotNull(attribute);
    }

    private static async Task<Fixture> CreateFixtureAsync(
        UserRole role,
        bool useSqlite = false,
        Exception? auditFailure = null)
    {
        var organizationId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        var currentUser = new FakeCurrentUserService
        {
            User = new AuthenticatedUser
            {
                UserId = userId,
                Email = "admin@test.com",
                FullName = "Test Admin",
                OrganizationId = organizationId,
                Role = role,
            },
        };

        SqliteConnection? connection = null;
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        if (useSqlite)
        {
            connection = new SqliteConnection("Data Source=:memory:");
            await connection.OpenAsync();
            optionsBuilder.UseSqlite(connection);
        }
        else
        {
            optionsBuilder.UseInMemoryDatabase(Guid.NewGuid().ToString());
        }

        var db = new ApplicationDbContext(optionsBuilder.Options, currentUser, new FakeDomainEventDispatcher());
        if (useSqlite)
        {
            await db.Database.EnsureCreatedAsync();
        }

        var organization = new Organization { Id = organizationId, Name = "Test Org", Slug = "test-org" };
        db.Organizations.Add(organization);
        db.Users.Add(new ApplicationUser
        {
            Id = userId,
            UserName = "admin@test.com",
            Email = "admin@test.com",
            FullName = "Test Admin",
            OrganizationId = organizationId,
            Role = role,
        });
        await db.SaveChangesAsync();

        var project = new Project(organizationId, "Test Project", "TST", null, "#2563EB", null);
        db.Projects.Add(project);
        await db.SaveChangesAsync();

        var board = new Board(project.Id, "Test Board", null);
        db.Boards.Add(board);
        await db.SaveChangesAsync();

        var column = new Column(board.Id, "To Do", null, 1);
        db.Columns.Add(column);
        await db.SaveChangesAsync();

        var workItem = new WorkItem(column.Id, "Test work item", null, WorkItemPriority.Medium, null, 1000);
        db.WorkItems.Add(workItem);
        await db.SaveChangesAsync();

        return new Fixture
        {
            Db = db,
            CurrentUser = currentUser,
            UserId = userId,
            OrganizationId = organizationId,
            Connection = connection,
            Project = project,
            Board = board,
            Column = column,
            WorkItem = workItem,
            Audit = new FakeAuditLogService { Failure = auditFailure },
            Realtime = new FakeRealtimeNotifier(),
        };
    }

    private sealed class Fixture : IAsyncDisposable
    {
        public required ApplicationDbContext Db { get; init; }
        public required FakeCurrentUserService CurrentUser { get; init; }
        public required Guid UserId { get; init; }
        public required Guid OrganizationId { get; init; }
        public SqliteConnection? Connection { get; init; }
        public required Project Project { get; init; }
        public required Board Board { get; init; }
        public required Column Column { get; init; }
        public required WorkItem WorkItem { get; init; }
        public required FakeAuditLogService Audit { get; init; }
        public required FakeRealtimeNotifier Realtime { get; init; }

        public async ValueTask DisposeAsync()
        {
            await Db.DisposeAsync();
            if (Connection is not null)
            {
                await Connection.DisposeAsync();
            }
        }
    }

    private sealed class FakeOnlineUserTracker : IOnlineUserTracker
    {
        private readonly HashSet<Guid> _onlineUsers;

        public FakeOnlineUserTracker(params Guid[] userIds)
        {
            _onlineUsers = userIds.ToHashSet();
        }

        public Task UserConnectedAsync(Guid userId)
        {
            _onlineUsers.Add(userId);
            return Task.CompletedTask;
        }

        public Task UserDisconnectedAsync(Guid userId)
        {
            _onlineUsers.Remove(userId);
            return Task.CompletedTask;
        }

        public bool IsOnline(Guid userId) => _onlineUsers.Contains(userId);

        public IReadOnlyCollection<Guid> GetOnlineUsers() => _onlineUsers.ToArray();
    }

    private sealed class FakeCurrentUserService : ICurrentUserService
    {
        public AuthenticatedUser User { get; set; } = default!;
        public AuthenticatedUser? TryGetUser() => User;
    }

    private sealed class FakeDomainEventDispatcher : IDomainEventDispatcher
    {
        public Task DispatchAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default)
            where TEvent : IDomainEvent => Task.CompletedTask;
    }

    private sealed class FakeAuditLogService : IAuditLogService
    {
        public List<AuditLogEntry> Entries { get; } = new();
        public Exception? Failure { get; init; }

        public Task CreateAsync(AuditLogEntry entry, CancellationToken cancellationToken = default)
        {
            if (Failure is not null)
            {
                throw Failure;
            }

            Entries.Add(entry);
            return Task.CompletedTask;
        }

        public Task<PagedResult<GetAuditLogsResponse>> GetAsync(GetAuditLogsRequest request, CancellationToken cancellationToken = default)
            => throw new NotSupportedException();

        public Task<AuditLogStatistics> GetStatisticsAsync(Guid organizationId, CancellationToken cancellationToken = default)
            => throw new NotSupportedException();
    }

    private sealed class FakeRealtimeNotifier : IRealtimeNotifier
    {
        public List<(string EventName, object Payload)> BoardEvents { get; } = new();
        public List<(string EventName, object Payload)> OrganizationEvents { get; } = new();

        public Task NotifyUserAsync(Guid userId, string eventName, object payload, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyOrganizationAsync(Guid organizationId, string eventName, object payload, CancellationToken cancellationToken = default)
        {
            OrganizationEvents.Add((eventName, payload));
            return Task.CompletedTask;
        }

        public Task NotifyUserOnlineAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyUserOfflineAsync(Guid userId, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyBoardAsync(Guid boardId, string eventName, object payload, CancellationToken cancellationToken = default)
        {
            BoardEvents.Add((eventName, payload));
            return Task.CompletedTask;
        }

        public Task NotifyBoardPresenceChangedAsync(Guid boardId, IReadOnlyCollection<BoardViewer> users, CancellationToken cancellationToken = default)
            => Task.CompletedTask;

        public Task NotifyRoleChangedAsync(Guid userId, Guid organizationId, UserRole newRole, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }
}
