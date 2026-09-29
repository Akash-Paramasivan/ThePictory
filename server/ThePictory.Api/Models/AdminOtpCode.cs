namespace ThePictory.Api.Models;

public class AdminOtpCode
{
    public int Id { get; set; }
    public int AdminUserId { get; set; }
    public AdminUser? AdminUser { get; set; }

    /// Opaque handle returned from /login and required (with the code) at /verify-otp, so the code alone can't be replayed against a guessed user id.
    public Guid Ticket { get; set; } = Guid.NewGuid();
    public string CodeHash { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool Consumed { get; set; }
    public int AttemptCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
