using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThePictory.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHomepageVideoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HomepageVideoUrl",
                table: "SiteSettings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HomepageVideoUrl",
                table: "SiteSettings");
        }
    }
}
