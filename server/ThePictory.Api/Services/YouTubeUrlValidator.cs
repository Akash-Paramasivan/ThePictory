using System.Text.RegularExpressions;

namespace ThePictory.Api.Services;

public static partial class YouTubeUrlValidator
{
    // YouTube showcase video: accepts watch?v=, youtu.be/, shorts/, embed/ and live/ URLs, with any trailing query string.
    [GeneratedRegex(@"^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?(?:[^#\s]*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]{6,20}(?:[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YouTubePattern();

    // Instagram showcase video: accepts /reel/, /p/, /tv/ paths with optional trailing slash, query parameters, and fragments
    [GeneratedRegex(@"^https?:\/\/(?:www\.)?instagram\.com\/(?:reel|p|tv)\/[a-zA-Z0-9_-]+(?:\/|\?[^\s#]*|\#[^\s]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex InstagramPattern();

    // Lenient YouTube channel/profile URL (channel/ID, @handle, user/...) with optional query strings
    [GeneratedRegex(@"^https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/[\w-]+|@[\w.-]+|user\/[\w.-]+|c\/[\w.-]+)(?:\/|[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YoutubeProfilePattern();

    // Lenient Instagram profile URL (username path, excluding reel/p/tv/explore/etc.) with optional query strings
    [GeneratedRegex(@"^https?:\/\/(?:www\.)?instagram\.com\/(?!reel|p|tv|explore|accounts)([a-zA-Z0-9_.-]+)(?:\/|[?&][^\s#]*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex InstagramProfilePattern();

    public static bool IsValid(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        var trimmed = url.Trim();
        return YouTubePattern().IsMatch(trimmed) || InstagramPattern().IsMatch(trimmed);
    }

    public static bool IsYouTubeUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return YouTubePattern().IsMatch(url.Trim());
    }

    public static bool IsInstagramUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        return InstagramPattern().IsMatch(url.Trim());
    }

    public static bool IsValidSocialProfile(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return true;
        var trimmed = url.Trim();
        return YoutubeProfilePattern().IsMatch(trimmed) || InstagramProfilePattern().IsMatch(trimmed);
    }
}