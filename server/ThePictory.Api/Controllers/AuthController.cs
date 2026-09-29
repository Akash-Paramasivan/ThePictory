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
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthController> _logger;
    private const int OtpExpiryMinutes = 5;
    private const int MaxOtpAttempts = 5;

    public AuthController(ApplicationDbContext db, IEmailService emailService, IJwtService jwtService, ILogger<AuthController> logger)
    {
        _db = db;
        _emailService = emailService;
        _jwtService = jwtService;
        _logger = logger;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var admin = await _db.AdminUsers.FirstOrDefaultAsync(a => a.Username == request.Username, ct);

        // Always verify against a hash to keep timing consistent whether or not the username exists.
        var passwordValid = admin is not null && BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash);
        if (admin is null || !passwordValid)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var code = Random.Shared.Next(0, 1_000_000).ToString("D6");
        var otp = new AdminOtpCode
        {
            AdminUserId = admin.Id,
            CodeHash = BCrypt.Net.BCrypt.HashPassword(code),
            ExpiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes)
        };
        _db.AdminOtpCodes.Add(otp);
        await _db.SaveChangesAsync(ct);

        await _emailService.SendOtpCodeAsync(admin.Email, code, ct);

        return Ok(new LoginResponse(otp.Ticket, "Verification code sent to the admin email address."));
    }

    [HttpPost("verify-otp")]
    public async Task<ActionResult<VerifyOtpResponse>> VerifyOtp(VerifyOtpRequest request, CancellationToken ct)
    {
        var otp = await _db.AdminOtpCodes
            .Include(o => o.AdminUser)
            .FirstOrDefaultAsync(o => o.Ticket == request.Ticket, ct);

        if (otp is null || otp.Consumed || otp.ExpiresAt < DateTime.UtcNow || otp.AdminUser is null)
        {
            return Unauthorized(new { message = "Code expired or invalid, please log in again." });
        }

        if (otp.AttemptCount >= MaxOtpAttempts)
        {
            return Unauthorized(new { message = "Too many attempts, please log in again." });
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Code, otp.CodeHash))
        {
            otp.AttemptCount++;
            await _db.SaveChangesAsync(ct);
            return Unauthorized(new { message = "Invalid code." });
        }

        otp.Consumed = true;
        await _db.SaveChangesAsync(ct);

        var token = _jwtService.GenerateToken(otp.AdminUser);
        return Ok(new VerifyOtpResponse(token, DateTime.UtcNow.AddMinutes(60)));
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new { username = User.Identity?.Name });
}
