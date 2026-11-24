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
            // Fix role values to match UserRole enum: Admin=1, Member=2, Viewer=3
            // Previous migration incorrectly used 0 for Admin and 1 for Member
            
            // Fix Admin role (was 0, should be 1)
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers 
                SET Role = 1 
                WHERE Role = 0
            ");

            // Fix Member role (was 1, should be 2) 
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers 
                SET Role = 2 
                WHERE Role = 1
            ");

            // Fix Viewer role (was 2, should be 3) - if any existed
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers 
                SET Role = 3 
                WHERE Role = 2
            ");

            // Truncate AspNetUsers and OrganizationUsers tables and reseed properly
            migrationBuilder.Sql(@"
                DELETE FROM OrganizationUsers;
                DELETE FROM AspNetUsers;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert role values back (not typically needed)
            migrationBuilder.Sql(@"
                UPDATE OrganizationUsers 
                SET Role = 0 
                WHERE Role = 1;
                
                UPDATE OrganizationUsers 
                SET Role = 1 
                WHERE Role = 2;
                
                UPDATE OrganizationUsers 
                SET Role = 2 
                WHERE Role = 3;
            ");
        }
    }
}