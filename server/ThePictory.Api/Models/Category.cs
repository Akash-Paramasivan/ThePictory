namespace ThePictory.Api.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SortOrder { get; set; }

    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
