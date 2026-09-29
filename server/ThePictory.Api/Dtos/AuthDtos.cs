using System.ComponentModel.DataAnnotations;

namespace ThePictory.Api.Dtos;

public record LoginRequest(
    [Required, StringLength(100)] string Username,
    [Required, StringLength(200)] string Password);

public record LoginResponse(Guid Ticket, string Message);

public record VerifyOtpRequest(
    [Required] Guid Ticket,
    [Required, StringLength(6, MinimumLength = 6)] string Code);

public record VerifyOtpResponse(string Token, DateTime ExpiresAt);
