namespace ThePictory.Api.Models;

public class TestimonialVideo
{
    public int Id { get; set; }
    public string YouTubeUrl { get; set; } = string.Empty;
    public string CoupleName { get; set; } = string.Empty;
    public DateTime? WeddingDate { get; set; }
    public int DisplayOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}