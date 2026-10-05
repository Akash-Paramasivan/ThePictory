using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/blogposts")]
public class BlogPostsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinary;
    public BlogPostsController(ApplicationDbContext db, ICloudinaryService cloudinary)
    {
        _db = db;
        _cloudinary = cloudinary;
    }

    [HttpGet]
    public async Task<ActionResult<List<BlogPostDto>>> GetActive(CancellationToken ct)
    {
        var posts = await _db.BlogPosts
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);
        return Ok(posts.Select(p => new BlogPostDto(p.Id, p.Title, p.Description, p.ImageUrl, p.IsActive)).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BlogPostDto>> Create([FromForm] string title, [FromForm] string description, IFormFile file, CancellationToken ct)
    {
        var (url, publicId) = await _cloudinary.UploadImageAsync(file.OpenReadStream(), file.FileName, ct);
        var post = new BlogPost { Title = title, Description = description, ImageUrl = url, CloudinaryPublicId = publicId, IsActive = true };
        _db.BlogPosts.Add(post);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetActive), new BlogPostDto(post.Id, post.Title, post.Description, post.ImageUrl, post.IsActive));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var post = await _db.BlogPosts.FindAsync([id], ct);
        if (post is null) return NotFound();
        if (!string.IsNullOrEmpty(post.CloudinaryPublicId)) await _cloudinary.DeleteImageAsync(post.CloudinaryPublicId, ct);
        _db.BlogPosts.Remove(post);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
