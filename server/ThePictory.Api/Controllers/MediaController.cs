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
    private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

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
            .Select(m => new MediaItemDto(m.Id, m.CategoryId, m.Category!.Name, m.Title, m.Description, m.CloudinaryUrl, m.SortOrder, m.IsFeatured, m.IsSlide, m.SlideOrder, m.CreatedAt))
            .ToListAsync(ct);

        return Ok(items);
    }

    [Authorize]
    [HttpPost("upload")]
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<ActionResult<MediaItemDto>> Upload([FromForm] IFormFile file, [FromForm] int categoryId, [FromForm] string title, [FromForm] string? description, CancellationToken ct)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "No file provided." });
        }
        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(new { message = "File exceeds the 10 MB limit." });
        }
        if (!AllowedContentTypes.Contains(file.ContentType))
        {
            return BadRequest(new { message = "Only JPEG, PNG, or WEBP images are allowed." });
        }

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == categoryId, ct);
        if (!categoryExists)
        {
            return BadRequest(new { message = "Invalid category." });
        }

        await using var stream = file.OpenReadStream();
        var (url, publicId) = await _cloudinaryService.UploadImageAsync(stream, file.FileName, ct);

        var maxSort = await _db.MediaItems.Where(m => m.CategoryId == categoryId).Select(m => (int?)m.SortOrder).MaxAsync(ct) ?? 0;
        var mediaItem = new MediaItem
        {
            CategoryId = categoryId,
            Title = title.Trim(),
            Description = description?.Trim(),
            CloudinaryUrl = url,
            CloudinaryPublicId = publicId,
            SortOrder = maxSort + 1,
            IsSlide = false,
            SlideOrder = 0
        };
        _db.MediaItems.Add(mediaItem);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAll), new MediaItemDto(mediaItem.Id, mediaItem.CategoryId, null, mediaItem.Title, mediaItem.Description, mediaItem.CloudinaryUrl, mediaItem.SortOrder, mediaItem.IsFeatured, mediaItem.IsSlide, mediaItem.SlideOrder, mediaItem.CreatedAt));
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
