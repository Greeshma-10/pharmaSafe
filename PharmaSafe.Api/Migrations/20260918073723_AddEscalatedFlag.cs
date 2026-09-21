using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmaSafe.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEscalatedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Escalated",
                table: "Cases",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Escalated",
                table: "Cases");
        }
    }
}
