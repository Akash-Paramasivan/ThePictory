using Microsoft.AspNetCore.Mvc;

namespace ThePictory.Api.Controllers;

/// <summary>
/// Lightweight liveness probe for Render's free tier.
/// Deliberately avoids the database and any heavy dependencies so it
/// stays fast even during cold starts.
/// </summary>
[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });
}
