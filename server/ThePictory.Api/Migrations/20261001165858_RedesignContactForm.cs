using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThePictory.Api.Migrations
{
    /// <inheritdoc />
    public partial class RedesignContactForm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone",
                table: "ContactSubmissions");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "ContactSubmissions",
                newName: "WhatsAppNumber");

            migrationBuilder.RenameColumn(
                name: "Message",
                table: "ContactSubmissions",
                newName: "WhatsAppCountryCode");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "ContactSubmissions",
                newName: "PhotographyDays");

            migrationBuilder.AddColumn<string>(
                name: "Budget",
                table: "ContactSubmissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "EventType",
                table: "ContactSubmissions",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "ContactSubmissions",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Budget",
                table: "ContactSubmissions");

            migrationBuilder.DropColumn(
                name: "EventType",
                table: "ContactSubmissions");

            migrationBuilder.DropColumn(
                name: "FullName",
                table: "ContactSubmissions");

            migrationBuilder.RenameColumn(
                name: "WhatsAppNumber",
                table: "ContactSubmissions",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "WhatsAppCountryCode",
                table: "ContactSubmissions",
                newName: "Message");

            migrationBuilder.RenameColumn(
                name: "PhotographyDays",
                table: "ContactSubmissions",
                newName: "Email");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "ContactSubmissions",
                type: "text",
                nullable: true);
        }
    }
}
