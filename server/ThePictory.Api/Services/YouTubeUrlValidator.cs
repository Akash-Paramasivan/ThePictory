using System.Text.RegularExpressions;

namespace ThePictory.Api.Services;

public static partial class YouTubeUrlValidator
{
    // Accepts watch?v= (including extra params like ?si=...&v=), youtu.be/, shorts/, embed/ and live/ URLs,
    // with any trailing query string. The video id itself is always captured right after the path prefix.
    [GeneratedRegex(@"^https://(?:www\.)?(?:youtube\.com/(?:watch\?[^#\s]*v=|shorts/|embed/|live/)|youtu\.be/)[\w-]{6,20}(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex Pattern();

    public static bool IsValid(string? url) => !string.IsNullOrWhiteSpace(url) && Pattern().IsMatch(url);
}
