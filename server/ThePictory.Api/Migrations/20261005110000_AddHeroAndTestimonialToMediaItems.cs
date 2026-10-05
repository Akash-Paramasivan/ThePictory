using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ThePictory.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHeroAndTestimonialToMediaItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHero",
                table: "MediaItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsTestimonial",
                table: "MediaItems",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsTestimonial",
                table: "MediaItems");

            migrationBuilder.DropColumn(
                name: "IsHero",
                table: "MediaItems");
        }
    }
}
