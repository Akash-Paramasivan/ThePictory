namespace ThePictory.Api.Models;

public class MediaItem
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string CloudinaryUrl { get; set; } = string.Empty;
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsSlide { get; set; }
    public int SlideOrder { get; set; }
    public bool IsHero { get; set; }
    public bool IsTestimonial { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
