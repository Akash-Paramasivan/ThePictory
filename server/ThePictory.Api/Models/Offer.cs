namespace ThePictory.Api.Models;

public enum OfferMediaType
{
    Image,
    YouTube
}

public class Offer
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public OfferMediaType MediaType { get; set; }
    public string? ImageUrl { get; set; }
    public string? CloudinaryPublicId { get; set; }
    public string? YouTubeUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
