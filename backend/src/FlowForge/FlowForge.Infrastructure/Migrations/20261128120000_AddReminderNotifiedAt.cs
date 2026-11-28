using System;
using FlowForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowForge.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261128120000_AddReminderNotifiedAt")]
public partial class AddReminderNotifiedAt : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<DateTime>(
            name: "ReminderNotifiedAt",
            table: "WorkItems",
            type: "datetime2",
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_WorkItems_ReminderDate_ReminderNotifiedAt",
            table: "WorkItems",
            columns: new[] { "ReminderDate", "ReminderNotifiedAt" });
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_WorkItems_ReminderDate_ReminderNotifiedAt",
            table: "WorkItems");

        migrationBuilder.DropColumn(
            name: "ReminderNotifiedAt",
            table: "WorkItems");
    }
}
