using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/offers")]
public partial class OffersController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public OffersController(ApplicationDbContext db, ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    [GeneratedRegex(@"^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,20}(&\S*)?$", RegexOptions.IgnoreCase)]
    private static partial Regex YouTubeUrlPattern();

    private static OfferDto ToDto(Offer o) => new(
        o.Id, o.Title, o.Description, o.MediaType, o.ImageUrl, o.YouTubeUrl, o.IsActive, o.StartDate, o.EndDate);

    [HttpGet("active")]
    public async Task<ActionResult<List<OfferDto>>> GetActive(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var offers = await _db.Offers
            .Where(o => o.IsActive
                && (o.StartDate == null || o.StartDate <= now)
                && (o.EndDate == null || o.EndDate >= now))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync(ct);
        return Ok(offers.Select(ToDto).ToList());
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<OfferDto>>> GetAll(CancellationToken ct)
    {
        var offers = await _db.Offers.OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
        return Ok(offers.Select(ToDto).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<OfferDto>> Create(
        [FromForm] string title,
        [FromForm] string? description,
        [FromForm] OfferMediaType mediaType,
        [FromForm] string? youTubeUrl,
        [FromForm] bool isActive,
        [FromForm] DateTime? startDate,
        [FromForm] DateTime? endDate,
        IFormFile? file,
        CancellationToken ct)
    {
        var offer = new Offer
        {
            Title = title.Trim(),
            Description = description?.Trim(),
            MediaType = mediaType,
            IsActive = isActive,
            StartDate = startDate,
            EndDate = endDate
        };

        if (mediaType == OfferMediaType.YouTube)
        {
            if (string.IsNullOrWhiteSpace(youTubeUrl) || !YouTubeUrlPattern().IsMatch(youTubeUrl))
            {
                return BadRequest(new { message = "A valid YouTube URL is required." });
            }
            offer.YouTubeUrl = youTubeUrl;
        }
        else
        {
            if (file is null || file.Length == 0)
            {
                return BadRequest(new { message = "An image file is required." });
            }
            if (file.Length > MaxFileSizeBytes)
            {
                return BadRequest(new { message = "File exceeds the 10 MB limit." });
            }
            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = "Only JPEG, PNG, or WEBP images are allowed." });
            }

            await using var stream = file.OpenReadStream();
            var (url, publicId) = await _cloudinaryService.UploadImageAsync(stream, file.FileName, ct);
            offer.ImageUrl = url;
            offer.CloudinaryPublicId = publicId;
        }

        _db.Offers.Add(offer);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetAll), ToDto(offer));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOfferRequest request, CancellationToken ct)
    {
        var offer = await _db.Offers.FindAsync([id], ct);
        if (offer is null) return NotFound();

        offer.Title = request.Title.Trim();
        offer.Description = request.Description?.Trim();
        offer.IsActive = request.IsActive;
        offer.StartDate = request.StartDate;
        offer.EndDate = request.EndDate;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var offer = await _db.Offers.FindAsync([id], ct);
        if (offer is null) return NotFound();

        if (!string.IsNullOrEmpty(offer.CloudinaryPublicId))
        {
            await _cloudinaryService.DeleteImageAsync(offer.CloudinaryPublicId, ct);
        }

        _db.Offers.Remove(offer);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
