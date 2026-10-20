using System.Text.RegularExpressions;

namespace ThePictory.Api.Services;

public static partial class YouTubeUrlValidator
{
    // YouTube: accepts watch?v=, youtu.be/, shorts/, embed/ and live/ URLs, with any trailing query string.
    [GeneratedRegex(@"^https://(?:www\.)?(?:youtube\.com/(?:watch\?[^#\s]*v=|shorts/|embed/|live/)|youtu\.be/)[\w-]{6,20}(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YouTubePattern();

    // Instagram: accepts /reel/, /p/, /tv/ paths with optional query parameters
    [GeneratedRegex(@"^https://(?:www\.)?instagram\.com/(?:reel|p|tv)/[\w-]{6,20}(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex InstagramPattern();

    public static bool IsValid(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true; // Empty is valid (optional field)
        return YouTubePattern().IsMatch(url) || InstagramPattern().IsMatch(url);
    }

    public static bool IsYouTubeUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return YouTubePattern().IsMatch(url);
    }

    public static bool IsInstagramUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return InstagramPattern().IsMatch(url);
    }
}