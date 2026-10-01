namespace ThePictory.Api.Options;

public class EmailOptions
{
    public const string SectionName = "Email";
    public string ApiKey { get; set; } = string.Empty;
    public string FromAddress { get; set; } = string.Empty;
    public string FromName { get; set; } = "The Pictory";
    public string AdminNotificationAddress { get; set; } = string.Empty;
}
