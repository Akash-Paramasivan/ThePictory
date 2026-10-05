using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/movies")]
public class MoviesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    public MoviesController(ApplicationDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<MovieDto>>> GetActive(CancellationToken ct)
    {
        var movies = await _db.Movies.Where(m => m.IsActive).OrderByDescending(m => m.CreatedAt).ToListAsync(ct);
        return Ok(movies.Select(m => new MovieDto(m.Id, m.Title, m.Description, m.VideoUrl, m.IsActive)).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<MovieDto>> Create([FromForm] string title, [FromForm] string description, [FromForm] string videoUrl, CancellationToken ct)
    {
        var movie = new Movie { Title = title, Description = description, VideoUrl = videoUrl, IsActive = true };
        _db.Movies.Add(movie);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetActive), new MovieDto(movie.Id, movie.Title, movie.Description, movie.VideoUrl, movie.IsActive));
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var movie = await _db.Movies.FindAsync([id], ct);
        if (movie is null) return NotFound();
        _db.Movies.Remove(movie);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
