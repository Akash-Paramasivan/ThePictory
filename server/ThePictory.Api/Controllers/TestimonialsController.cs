using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TestimonialsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var testimonials = await _db.TestimonialVideos
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TestimonialVideoDto(t.Id, t.YouTubeUrl, t.CoupleName, t.WeddingDate))
            .ToListAsync();

        return Ok(testimonials);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create(CreateTestimonialVideoRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.YouTubeUrl))
        {
            return BadRequest(new { message = "YouTube URL is required." });
        }

        var cleanedUrl = YouTubeUrlValidator.Clean(request.YouTubeUrl);
        if (!YouTubeUrlValidator.IsValid(cleanedUrl))
        {
            return BadRequest(new { message = "Invalid YouTube URL. Please provide a valid video link." });
        }

        var maxOrder = await _db.TestimonialVideos.Select(t => (int?)t.DisplayOrder).MaxAsync(ct) ?? 0;

        var testimonial = new TestimonialVideo
        {
            YouTubeUrl = cleanedUrl,
            CoupleName = request.CoupleName?.Trim() ?? string.Empty,
            WeddingDate = request.WeddingDate,
            DisplayOrder = maxOrder + 1,
            CreatedAt = DateTime.UtcNow
        };

        _db.TestimonialVideos.Add(testimonial);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetAll), new { id = testimonial.Id }, new TestimonialVideoDto(testimonial.Id, testimonial.YouTubeUrl, testimonial.CoupleName, testimonial.WeddingDate));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var testimonial = await _db.TestimonialVideos.FindAsync([id], ct);
        if (testimonial is null) return NotFound();

        _db.TestimonialVideos.Remove(testimonial);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}