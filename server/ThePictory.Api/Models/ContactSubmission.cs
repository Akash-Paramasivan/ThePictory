namespace ThePictory.Api.Models;

public class ContactSubmission
{
    public int Id { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string PhotographyDays { get; set; } = string.Empty;
    public string Budget { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string WhatsAppCountryCode { get; set; } = string.Empty;
    public string WhatsAppNumber { get; set; } = string.Empty;
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public bool IsRead { get; set; }
}
