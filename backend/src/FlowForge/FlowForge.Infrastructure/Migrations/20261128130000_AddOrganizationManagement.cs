using System;
using FlowForge.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowForge.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261128130000_AddOrganizationManagement")]
public partial class AddOrganizationManagement : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsOwner",
            table: "OrganizationUsers",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<int>(
            name: "TokenVersion",
            table: "OrganizationUsers",
            type: "int",
            nullable: false,
            defaultValue: 0);

        migrationBuilder.AddColumn<byte[]>(
            name: "RowVersion",
            table: "OrganizationUsers",
            type: "rowversion",
            nullable: false);

        migrationBuilder.Sql(
            "UPDATE OrganizationUsers SET Id = NEWID() WHERE Id = '00000000-0000-0000-0000-000000000000';");

        migrationBuilder.Sql(@"
DECLARE @MissingAdmins nvarchar(max) = (
    SELECT STRING_AGG(CONVERT(nvarchar(36), OrganizationId), ', ')
    FROM (
        SELECT o.Id AS OrganizationId
        FROM Organizations AS o
        LEFT JOIN OrganizationUsers AS ou
            ON ou.OrganizationId = o.Id AND ou.IsDeleted = 0
        WHERE o.IsDeleted = 0
        GROUP BY o.Id
        HAVING SUM(CASE WHEN ou.Role = 1 THEN 1 ELSE 0 END) = 0
    ) AS Missing
);

IF @MissingAdmins IS NOT NULL
BEGIN
    DECLARE @MissingAdminsMessage nvarchar(max) =
        FORMATMESSAGE('Organizations without an active Admin: %s', @MissingAdmins);
    THROW 50000, @MissingAdminsMessage, 1;
END;

;WITH RankedAdmins AS (
    SELECT Id,
           ROW_NUMBER() OVER (
               PARTITION BY OrganizationId
               ORDER BY CreatedAt, Id
           ) AS Rank
    FROM OrganizationUsers
    WHERE IsDeleted = 0 AND Role = 1
)
UPDATE Membership
SET IsOwner = 1
FROM OrganizationUsers AS Membership
INNER JOIN RankedAdmins AS Ranked ON Ranked.Id = Membership.Id
WHERE Ranked.Rank = 1;");

        migrationBuilder.DropForeignKey(
            name: "FK_OrganizationUsers_AspNetUsers_ApplicationUserId",
            table: "OrganizationUsers");

        migrationBuilder.DropIndex(
            name: "IX_OrganizationUsers_ApplicationUserId",
            table: "OrganizationUsers");

        migrationBuilder.DropColumn(
            name: "ApplicationUserId",
            table: "OrganizationUsers");

        migrationBuilder.DropPrimaryKey(
            name: "PK_OrganizationUsers",
            table: "OrganizationUsers");

        migrationBuilder.AddPrimaryKey(
            name: "PK_OrganizationUsers",
            table: "OrganizationUsers",
            column: "Id");

        migrationBuilder.CreateIndex(
            name: "IX_OrganizationUsers_UserId_OrganizationId",
            table: "OrganizationUsers",
            columns: new[] { "UserId", "OrganizationId" },
            unique: true,
            filter: "IsDeleted = 0");

        migrationBuilder.CreateIndex(
            name: "IX_OrganizationUsers_OrganizationId_IsOwner",
            table: "OrganizationUsers",
            columns: new[] { "OrganizationId", "IsOwner" },
            unique: true,
            filter: "IsOwner = 1 AND IsDeleted = 0");

        migrationBuilder.AddForeignKey(
            name: "FK_OrganizationUsers_AspNetUsers_UserId",
            table: "OrganizationUsers",
            column: "UserId",
            principalTable: "AspNetUsers",
            principalColumn: "Id",
            onDelete: ReferentialAction.Restrict);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_OrganizationUsers_AspNetUsers_UserId",
            table: "OrganizationUsers");

        migrationBuilder.DropIndex(
            name: "IX_OrganizationUsers_OrganizationId_IsOwner",
            table: "OrganizationUsers");

        migrationBuilder.DropIndex(
            name: "IX_OrganizationUsers_UserId_OrganizationId",
            table: "OrganizationUsers");

        migrationBuilder.DropPrimaryKey(
            name: "PK_OrganizationUsers",
            table: "OrganizationUsers");

        migrationBuilder.AddPrimaryKey(
            name: "PK_OrganizationUsers",
            table: "OrganizationUsers",
            columns: new[] { "UserId", "OrganizationId" });

        migrationBuilder.DropColumn(
            name: "RowVersion",
            table: "OrganizationUsers");

        migrationBuilder.DropColumn(
            name: "TokenVersion",
            table: "OrganizationUsers");

        migrationBuilder.DropColumn(
            name: "IsOwner",
            table: "OrganizationUsers");

        migrationBuilder.AddColumn<Guid>(
            name: "ApplicationUserId",
            table: "OrganizationUsers",
            type: "uniqueidentifier",
            nullable: true);

        migrationBuilder.Sql(
            "UPDATE OrganizationUsers SET ApplicationUserId = UserId WHERE ApplicationUserId IS NULL;");

        migrationBuilder.CreateIndex(
            name: "IX_OrganizationUsers_ApplicationUserId",
            table: "OrganizationUsers",
            column: "ApplicationUserId");

        migrationBuilder.AddForeignKey(
            name: "FK_OrganizationUsers_AspNetUsers_ApplicationUserId",
            table: "OrganizationUsers",
            column: "ApplicationUserId",
            principalTable: "AspNetUsers",
            principalColumn: "Id");
    }
}
