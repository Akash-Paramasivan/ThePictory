using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public SettingsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<SiteSettingDto>> Get(CancellationToken ct)
    {
        var settings = await GetOrCreateSettingsAsync(ct);
        return Ok(new SiteSettingDto(settings.OffersPageEnabled, settings.HomepageVideoUrl));
    }

    [Authorize]
    [HttpPut]
    public async Task<ActionResult<SiteSettingDto>> Update(UpdateSiteSettingRequest request, CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(request.HomepageVideoUrl) && !YouTubeUrlValidator.IsValid(request.HomepageVideoUrl))
        {
            return BadRequest(new { message = "A valid YouTube URL is required." });
        }

        var settings = await GetOrCreateSettingsAsync(ct);
        settings.OffersPageEnabled = request.OffersPageEnabled;
        settings.HomepageVideoUrl = string.IsNullOrWhiteSpace(request.HomepageVideoUrl) ? null : request.HomepageVideoUrl;
        await _db.SaveChangesAsync(ct);
        return Ok(new SiteSettingDto(settings.OffersPageEnabled, settings.HomepageVideoUrl));
    }

    private async Task<SiteSetting> GetOrCreateSettingsAsync(CancellationToken ct)
    {
        var settings = await _db.SiteSettings.FindAsync([1], ct);
        if (settings is null)
        {
            settings = new SiteSetting { Id = 1, OffersPageEnabled = false };
            _db.SiteSettings.Add(settings);
            await _db.SaveChangesAsync(ct);
        }
        return settings;
    }
}
