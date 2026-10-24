using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/gallery")]
public class GalleryController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public GalleryController(ApplicationDbContext db, ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<ActionResult> GetGalleryData()
    {
        var heroImage = await _db.GalleryItems
            .Where(g => g.IsHeroCover)
            .OrderBy(g => g.DisplayOrder)
            .Select(g => new { g.ImageUrl, g.Title })
            .FirstOrDefaultAsync();

        var photos = await _db.GalleryItems
            .Where(g => !g.IsHeroCover)
            .OrderBy(g => g.DisplayOrder)
            .Select(g => new { g.Id, g.ImageUrl, g.Title })
            .ToListAsync();

        var testimonials = await _db.TestimonialVideos
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new { t.Id, t.YouTubeUrl, t.CoupleName, t.WeddingDate })
            .ToListAsync();

        return Ok(new
        {
            heroImage,
            photos,
            testimonials
        });
    }

    [Authorize]
    [HttpPost("bulk-upload")]
    [RequestSizeLimit(100 * 1024 * 1024)] // 100 MB total request limit
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
    public async Task<ActionResult<List<GalleryItemDto>>> BulkUpload([FromForm] List<IFormFile> files, [FromForm] string? title, CancellationToken ct)
    {
        if (files is null || files.Count == 0)
        {
            return BadRequest(new { message = "No files provided." });
        }

        var results = new List<GalleryItemDto>();
        var currentMaxOrder = await _db.GalleryItems.Select(g => (int?)g.DisplayOrder).MaxAsync(ct) ?? 0;

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            const long maxFileSize = 15 * 1024 * 1024; // 15 MB per file limit
            if (file.Length > maxFileSize)
            {
                return BadRequest(new { message = $"File '{file.FileName}' exceeds the 15 MB limit." });
            }

            const string allowedContentTypes = "image/jpeg,image/png,image/webp";
            if (!allowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = $"File '{file.FileName}' has an unsupported format. Only JPEG, PNG, or WEBP images are allowed." });
            }

            await using var stream = file.OpenReadStream();
            var (url, publicId) = await _cloudinaryService.UploadImageAsync(stream, file.FileName, ct);

            currentMaxOrder++;

            var galleryItem = new GalleryItem
            {
                ImageUrl = url,
                CloudinaryPublicId = publicId,
                Title = !string.IsNullOrWhiteSpace(title) && files.Count == 1
                    ? title.Trim()
                    : Path.GetFileNameWithoutExtension(file.FileName),
                DisplayOrder = currentMaxOrder,
                IsHeroCover = false,
                CreatedAt = DateTime.UtcNow
            };

            _db.GalleryItems.Add(galleryItem);
            await _db.SaveChangesAsync(ct);

            results.Add(new GalleryItemDto(galleryItem.Id, galleryItem.ImageUrl, galleryItem.CloudinaryPublicId, galleryItem.Title, galleryItem.DisplayOrder, galleryItem.IsHeroCover, galleryItem.CreatedAt));
        }

        return Ok(results);
    }

    [Authorize]
    [HttpPut("set-cover/{id:int}")]
    public async Task<IActionResult> SetAsHeroCover(int id, CancellationToken ct)
    {
        var item = await _db.GalleryItems.FindAsync([id], ct);
        if (item is null) return NotFound();

        // First, unset any existing hero cover
        var existingHero = await _db.GalleryItems.Where(g => g.IsHeroCover).FirstOrDefaultAsync(ct);
        if (existingHero is not null)
        {
            existingHero.IsHeroCover = false;
        }

        // Set this item as hero cover
        item.IsHeroCover = true;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var item = await _db.GalleryItems.FindAsync([id], ct);
        if (item is null) return NotFound();

        await _cloudinaryService.DeleteImageAsync(item.CloudinaryPublicId, ct);
        _db.GalleryItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}