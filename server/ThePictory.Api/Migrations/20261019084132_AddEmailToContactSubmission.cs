using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThePictory.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddEmailToContactSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "ContactSubmissions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "ContactSubmissions");
        }
    }
}
