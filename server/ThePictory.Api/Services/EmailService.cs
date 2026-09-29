using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using ThePictory.Api.Options;

namespace ThePictory.Api.Services;

public interface IEmailService
{
    Task SendOtpCodeAsync(string toEmail, string code, CancellationToken ct = default);
    Task SendContactNotificationAsync(string name, string email, string? phone, string message, CancellationToken ct = default);
}

public class EmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailOptions> options, ILogger<EmailService> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task SendOtpCodeAsync(string toEmail, string code, CancellationToken ct = default)
    {
        var message = BuildMessage(toEmail, "Your admin login code",
            $"<p>Your one-time verification code is:</p><h2>{code}</h2><p>This code expires in 5 minutes. If you did not request this, ignore this email.</p>");
        return SendAsync(message, ct);
    }

    public Task SendContactNotificationAsync(string name, string email, string? phone, string message, CancellationToken ct = default)
    {
        var mimeMessage = BuildMessage(_options.AdminNotificationAddress, "New contact form submission",
            $"<p><strong>Name:</strong> {WebUtility(name)}</p>" +
            $"<p><strong>Email:</strong> {WebUtility(email)}</p>" +
            $"<p><strong>Phone:</strong> {WebUtility(phone ?? "-")}</p>" +
            $"<p><strong>Message:</strong><br/>{WebUtility(message)}</p>");
        return SendAsync(mimeMessage, ct);
    }

    private static string WebUtility(string value) => System.Net.WebUtility.HtmlEncode(value);

    private MimeMessage BuildMessage(string toEmail, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_options.FromName, _options.FromAddress));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = subject;
        message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();
        return message;
    }

    private async Task SendAsync(MimeMessage message, CancellationToken ct)
    {
        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(_options.SmtpHost, _options.SmtpPort, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(_options.SmtpUser, _options.SmtpPassword, ct);
            await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", message.To);
            throw;
        }
    }
}
