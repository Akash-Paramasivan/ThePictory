namespace ThePictory.Api.Models;

public class GalleryItem
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CloudinaryPublicId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsHeroCover { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}