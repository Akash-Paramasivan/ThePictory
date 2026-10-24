namespace ThePictory.Api.Dtos;

public record GalleryItemDto(
    int Id,
    string ImageUrl,
    string CloudinaryPublicId,
    string Title,
    int DisplayOrder,
    bool IsHeroCover,
    DateTime CreatedAt);

public record TestimonialVideoDto(
    int Id,
    string YouTubeUrl,
    string CoupleName,
    DateTime? WeddingDate);

public record GalleryResponse(
    GalleryItemDto? HeroImage,
    List<GalleryItemDto> Photos,
    List<TestimonialVideoDto> Testimonials);

public record CreateTestimonialVideoRequest(string YouTubeUrl, string? CoupleName, DateTime? WeddingDate);