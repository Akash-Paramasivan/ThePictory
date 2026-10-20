using System.Text.RegularExpressions;

namespace ThePictory.Api.Services;

public static partial class YouTubeUrlValidator
{
    // YouTube: accepts watch?v=, youtu.be/, shorts/, embed/ and live/ URLs, with any trailing query string.
    [GeneratedRegex(@"^https://(?:www\.)?(?:youtube\.com/(?:watch\?[^#\s]*v=|shorts/|embed/|live/)|youtu\.be/)[\w-]{6,20}(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YouTubePattern();

    // Instagram: accepts /reel/, /p/, /tv/ paths with optional query parameters and fragments
    [GeneratedRegex(@"^https?:\/\/www\.?instagram\.com\/(reel|p|tv)\/[a-zA-Z0-9_-]+(?:\/|\?[^\s]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex InstagramPattern();

    // Lenient YouTube channel/profile URL (channel/ID, @handle, user/...)
    [GeneratedRegex(@"^https://(?:www\.)?youtube\.com/(?:channel/[\w-]+|@[\w.-]+|user/[\w.-]+|c/[\w.-]+)(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YoutubeProfilePattern();

    // Lenient Instagram profile URL (username path, not reel/p/tv)
    [GeneratedRegex(@"^https://(?:www\.)?instagram\.com/([a-zA-Z0-9_.-]+)(?:\/|\?[^\s]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex InstagramProfilePattern();

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

    /// <summary>
    /// Validates a social profile URL (YouTube channel or Instagram profile).
    /// Empty/null is always valid; otherwise must match a profile/channel URL pattern.
    /// </summary>
    public static bool IsValidSocialProfile(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return YoutubeProfilePattern().IsMatch(url) || InstagramProfilePattern().IsMatch(url);
    }
}