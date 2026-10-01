using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using ThePictory.Api.Data;
using ThePictory.Api.Dtos;
using ThePictory.Api.Models;
using ThePictory.Api.Services;

namespace ThePictory.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;
    private readonly ILogger<ContactController> _logger;

    public ContactController(ApplicationDbContext db, IEmailService emailService, ILogger<ContactController> logger)
    {
        _db = db;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost]
    [EnableRateLimiting("contact-form")]
    public async Task<IActionResult> Submit(ContactSubmissionRequest request, CancellationToken ct)
    {
        var submission = new ContactSubmission
        {
            EventType = request.EventType.Trim(),
            PhotographyDays = request.PhotographyDays.Trim(),
            Budget = request.Budget.Trim(),
            FullName = request.FullName.Trim(),
            WhatsAppCountryCode = request.WhatsAppCountryCode.Trim(),
            WhatsAppNumber = request.WhatsAppNumber.Trim()
        };
        _db.ContactSubmissions.Add(submission);
        await _db.SaveChangesAsync(ct);

        try
        {
            await _emailService.SendContactNotificationAsync(submission.FullName, submission.EventType, submission.PhotographyDays, submission.Budget, $"{submission.WhatsAppCountryCode} {submission.WhatsAppNumber}", ct);
        }
        catch (Exception ex)
        {
            // Submission is already saved; admin can still see it in the portal even if the email failed.
            _logger.LogError(ex, "Failed to send contact notification email for submission {Id}", submission.Id);
        }

        return Ok(new { message = "Thanks! We'll get back to you soon." });
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<ContactSubmissionDto>>> GetAll(CancellationToken ct)
    {
        var submissions = await _db.ContactSubmissions
            .OrderByDescending(c => c.SubmittedAt)
            .Select(c => new ContactSubmissionDto(c.Id, c.EventType, c.PhotographyDays, c.Budget, c.FullName, c.WhatsAppCountryCode, c.WhatsAppNumber, c.SubmittedAt, c.IsRead))
            .ToListAsync(ct);
        return Ok(submissions);
    }

    [Authorize]
    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        var submission = await _db.ContactSubmissions.FindAsync([id], ct);
        if (submission is null) return NotFound();

        submission.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
