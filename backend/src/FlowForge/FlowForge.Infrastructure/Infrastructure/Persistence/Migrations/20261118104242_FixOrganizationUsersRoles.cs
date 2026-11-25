using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlowForge.Infrastructure.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixOrganizationUsersRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Fix legacy role values in one pass so newly corrected values are not
            // updated again by subsequent statements. User accounts are preserved.
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers
                SET Role = CASE Role
                    WHEN 0 THEN 1 -- Admin
                    WHEN 1 THEN 2 -- Member
                    WHEN 2 THEN 3 -- Viewer
                    ELSE Role
                END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers
                SET Role = CASE Role
                    WHEN 1 THEN 0
                    WHEN 2 THEN 1
                    WHEN 3 THEN 2
                    ELSE Role
                END
            ");
        }
    }
}