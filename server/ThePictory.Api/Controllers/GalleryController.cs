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
    public async Task<IActionResult> GetGalleryData()
    {
        var heroImage = await _db.GalleryItems
            .Where(g => g.IsHeroCover)
            .OrderBy(g => g.DisplayOrder)
            .Select(g => new GalleryItemDto(g.Id, g.ImageUrl, g.CloudinaryPublicId, g.Title, g.DisplayOrder, g.IsHeroCover, g.CreatedAt))
            .FirstOrDefaultAsync();

        var photos = await _db.GalleryItems
            .Where(g => !g.IsHeroCover)
            .OrderBy(g => g.DisplayOrder)
            .Select(g => new GalleryItemDto(g.Id, g.ImageUrl, g.CloudinaryPublicId, g.Title, g.DisplayOrder, g.IsHeroCover, g.CreatedAt))
            .ToListAsync();

        var testimonials = await _db.TestimonialVideos
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialVideoDto(t.Id, t.YouTubeUrl, t.CoupleName, t.WeddingDate))
            .ToListAsync();

        return Ok(new GalleryResponse(heroImage, photos, testimonials));
    }

    [Authorize]
    [HttpPost("hero")]
    [RequestSizeLimit(15 * 1024 * 1024)]
    public async Task<ActionResult<GalleryItemDto>> UploadHero([FromForm] IFormFile file, [FromForm] string? title, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest(new { message = "No file provided." });
        }

        const long maxFileSize = 15 * 1024 * 1024;
        if (file.Length > maxFileSize)
        {
            return BadRequest(new { message = "File exceeds the 15 MB limit." });
        }

        const string allowedContentTypes = "image/jpeg,image/png,image/webp";
        if (!allowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Unsupported file format. Only JPEG, PNG, or WEBP images are allowed." });
        }

        // Remove old hero image(s)
        var oldHeroes = await _db.GalleryItems.Where(g => g.IsHeroCover).ToListAsync(ct);
        foreach (var oldHero in oldHeroes)
        {
            await _cloudinaryService.DeleteImageAsync(oldHero.CloudinaryPublicId, ct);
            _db.GalleryItems.Remove(oldHero);
        }

        await using var stream = file.OpenReadStream();
        var (url, publicId) = await _cloudinaryService.UploadImageAsync(stream, file.FileName, ct);

        var heroItem = new GalleryItem
        {
            ImageUrl = url,
            CloudinaryPublicId = publicId,
            Title = string.IsNullOrWhiteSpace(title) ? Path.GetFileNameWithoutExtension(file.FileName) : title.Trim(),
            DisplayOrder = 0,
            IsHeroCover = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.GalleryItems.Add(heroItem);
        await _db.SaveChangesAsync(ct);

        return Ok(new GalleryItemDto(heroItem.Id, heroItem.ImageUrl, heroItem.CloudinaryPublicId, heroItem.Title, heroItem.DisplayOrder, heroItem.IsHeroCover, heroItem.CreatedAt));
    }

    [Authorize]
    [HttpPost("bulk-upload")]
    [RequestSizeLimit(100 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 100 * 1024 * 1024)]
    public async Task<ActionResult<List<GalleryItemDto>>> BulkUpload([FromForm] List<IFormFile> files, CancellationToken ct)
    {
        if (files is null || files.Count == 0)
        {
            return BadRequest(new { message = "No files provided." });
        }

        var results = new List<GalleryItemDto>();
        var currentMaxOrder = await _db.GalleryItems.Where(g => !g.IsHeroCover).Select(g => (int?)g.DisplayOrder).MaxAsync(ct) ?? 0;

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            const long maxFileSize = 15 * 1024 * 1024;
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
                Title = Path.GetFileNameWithoutExtension(file.FileName),
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

        var existingHeroes = await _db.GalleryItems.Where(g => g.IsHeroCover).ToListAsync(ct);
        foreach (var h in existingHeroes)
        {
            h.IsHeroCover = false;
        }

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