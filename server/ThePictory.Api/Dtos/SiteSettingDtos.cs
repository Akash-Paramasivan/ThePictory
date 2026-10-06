namespace ThePictory.Api.Dtos;

public record SiteSettingDto(
    bool OffersPageEnabled,
    string? HomepageVideoUrl,
    string? InstagramUrl,
    string? YoutubeProfileUrl
);

public record UpdateSiteSettingRequest(
    bool OffersPageEnabled,
    string? HomepageVideoUrl,
    string? InstagramUrl,
    string? YoutubeProfileUrl
);
