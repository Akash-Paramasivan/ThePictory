namespace ThePictory.Api.Models;

/// Singleton row (Id=1) holding site-wide toggles the admin controls.
public class SiteSetting
{
    public int Id { get; set; }
    public bool OffersPageEnabled { get; set; }
}
