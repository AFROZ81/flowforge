using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowForge.Infrastructure.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddInvitationEmailDeliveryStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmailAttempts",
                table: "OrganizationInvitations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "EmailError",
                table: "OrganizationInvitations",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "EmailSentAt",
                table: "OrganizationInvitations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EmailStatus",
                table: "OrganizationInvitations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastEmailSendAt",
                table: "OrganizationInvitations",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailAttempts",
                table: "OrganizationInvitations");

            migrationBuilder.DropColumn(
                name: "EmailError",
                table: "OrganizationInvitations");

            migrationBuilder.DropColumn(
                name: "EmailSentAt",
                table: "OrganizationInvitations");

            migrationBuilder.DropColumn(
                name: "EmailStatus",
                table: "OrganizationInvitations");

            migrationBuilder.DropColumn(
                name: "LastEmailSendAt",
                table: "OrganizationInvitations");
        }
    }
}
