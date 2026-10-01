namespace ThePictory.Api.Dtos;

public record SiteSettingDto(bool OffersPageEnabled);
public record UpdateSiteSettingRequest(bool OffersPageEnabled);
