using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp"
    };
    private const long MaxFileSizeBytes = 15 * 1024 * 1024; // 15 MB per file limit on backend
    private const long MaxTotalRequestSizeBytes = 100 * 1024 * 1024; // 100 MB total request limit for bulk upload

    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public MediaController(ApplicationDbContext db, ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<ActionResult<List<MediaItemDto>>> GetAll([FromQuery] int? categoryId, [FromQuery] bool? featuredOnly, CancellationToken ct)
    {
        var query = _db.MediaItems.Include(m => m.Category).AsQueryable();
        if (categoryId is not null) query = query.Where(m => m.CategoryId == categoryId);
        if (featuredOnly == true) query = query.Where(m => m.IsFeatured);

        var items = await query
            .OrderBy(m => m.SortOrder)
            .Select(m => new MediaItemDto(m.Id, m.CategoryId, m.Category!.Name, m.Title, m.Description, m.CloudinaryUrl, m.SortOrder, m.IsFeatured, m.IsSlide, m.SlideOrder, m.IsHero, m.IsTestimonial, m.CreatedAt))
            .ToListAsync(ct);

        return Ok(items);
    }

    [Authorize]
    [HttpPost("upload")]
    [RequestSizeLimit(MaxTotalRequestSizeBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxTotalRequestSizeBytes)]
    public async Task<ActionResult<List<MediaItemDto>>> Upload([FromForm] List<IFormFile> files, [FromForm] int categoryId, [FromForm] string? title, [FromForm] string? description, CancellationToken ct)
    {
        if (files is null || files.Count == 0)
        {
            return BadRequest(new { message = "No files provided." });
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == categoryId, ct);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid category." });
        }

        var results = new List<MediaItemDto>();
        var currentMaxSort = await _db.MediaItems.Where(m => m.CategoryId == categoryId).Select(m => (int?)m.SortOrder).MaxAsync(ct) ?? 0;

        foreach (var file in files)
        {
            if (file.Length == 0) continue;
            if (file.Length > MaxFileSizeBytes)
            {
                return BadRequest(new { message = $"File '{file.FileName}' exceeds the 15 MB limit." });
            }
            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new { message = $"File '{file.FileName}' has an unsupported format. Only JPEG, PNG, or WEBP images are allowed." });
            }

            await using var stream = file.OpenReadStream();
            var (url, publicId) = await _cloudinaryService.UploadImageAsync(stream, file.FileName, ct);

            currentMaxSort++;
            // Use file name without extension as default title if multiple files or no specific title given
            var fileTitle = !string.IsNullOrWhiteSpace(title) && files.Count == 1
                ? title.Trim()
                : Path.GetFileNameWithoutExtension(file.FileName);

            if (string.IsNullOrWhiteSpace(fileTitle))
            {
                fileTitle = "Untitled Photo";
            }

            var mediaItem = new MediaItem
            {
                CategoryId = categoryId,
                Title = fileTitle,
                Description = description?.Trim(),
                CloudinaryUrl = url,
                CloudinaryPublicId = publicId,
                SortOrder = currentMaxSort,
                IsSlide = false,
                SlideOrder = 0,
                IsHero = false,
                IsTestimonial = false
            };
            _db.MediaItems.Add(mediaItem);
            await _db.SaveChangesAsync(ct);

            var categoryName = await _db.Categories.Where(c => c.Id == categoryId).Select(c => c.Name).FirstOrDefaultAsync(ct);
            results.Add(new MediaItemDto(mediaItem.Id, mediaItem.CategoryId, categoryName, mediaItem.Title, mediaItem.Description, mediaItem.CloudinaryUrl, mediaItem.SortOrder, mediaItem.IsFeatured, mediaItem.IsSlide, mediaItem.SlideOrder, mediaItem.IsHero, mediaItem.IsTestimonial, mediaItem.CreatedAt));
        }

        return Ok(results);
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateMediaItemRequest request, CancellationToken ct)
    {
        var item = await _db.MediaItems.FindAsync([id], ct);
        if (item is null) return NotFound();

        item.CategoryId = request.CategoryId;
        item.Title = request.Title.Trim();
        item.Description = request.Description?.Trim();
        item.SortOrder = request.SortOrder;
        item.IsFeatured = request.IsFeatured;
        item.IsSlide = request.IsSlide;
        item.SlideOrder = request.SlideOrder;
        item.IsHero = request.IsHero;
        item.IsTestimonial = request.IsTestimonial;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var item = await _db.MediaItems.FindAsync([id], ct);
        if (item is null) return NotFound();

        await _cloudinaryService.DeleteImageAsync(item.CloudinaryPublicId, ct);
        _db.MediaItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
