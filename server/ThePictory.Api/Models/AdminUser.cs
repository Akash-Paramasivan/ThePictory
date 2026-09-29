namespace ThePictory.Api.Models;

public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    public ICollection<AdminOtpCode> OtpCodes { get; set; } = new List<AdminOtpCode>();
}
