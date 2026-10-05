namespace ThePictory.Api.Dtos;

public record MediaItemDto(
    int Id,
    int CategoryId,
    string? CategoryName,
    string Title,
    string? Description,
    string CloudinaryUrl,
    int SortOrder,
    bool IsFeatured,
    bool IsSlide,
    int SlideOrder,
    DateTime CreatedAt);

public record UpdateMediaItemRequest(int CategoryId, string Title, string? Description, int SortOrder, bool IsFeatured, bool IsSlide, int SlideOrder);
