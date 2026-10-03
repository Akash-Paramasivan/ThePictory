namespace ThePictory.Api.Dtos;

public record SiteSettingDto(bool OffersPageEnabled, string? HomepageVideoUrl);
public record UpdateSiteSettingRequest(bool OffersPageEnabled, string? HomepageVideoUrl);
