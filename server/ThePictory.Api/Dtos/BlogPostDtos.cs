namespace ThePictory.Api.Dtos;

public record BlogPostDto(int Id, string Title, string Description, string ImageUrl, bool IsActive);
