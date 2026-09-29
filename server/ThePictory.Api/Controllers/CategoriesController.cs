using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CategoriesController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAll(CancellationToken ct)
    {
        var categories = await _db.Categories
            .OrderBy(c => c.SortOrder)
            .Select(c => new CategoryDto(c.Id, c.Name, c.SortOrder))
            .ToListAsync(ct);
        return Ok(categories);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CreateCategoryRequest request, CancellationToken ct)
    {
        var category = new Category { Name = request.Name.Trim(), SortOrder = request.SortOrder };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(GetAll), new CategoryDto(category.Id, category.Name, category.SortOrder));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCategoryRequest request, CancellationToken ct)
    {
        var category = await _db.Categories.FindAsync([id], ct);
        if (category is null) return NotFound();

        category.Name = request.Name.Trim();
        category.SortOrder = request.SortOrder;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var category = await _db.Categories.FindAsync([id], ct);
        if (category is null) return NotFound();

        var hasMedia = await _db.MediaItems.AnyAsync(m => m.CategoryId == id, ct);
        if (hasMedia)
        {
            return Conflict(new { message = "Cannot delete a category that still has media items." });
        }

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
