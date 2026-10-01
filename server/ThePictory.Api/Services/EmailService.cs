using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using ThePictory.Api.Options;

namespace ThePictory.Api.Services;

public interface IEmailService
{
    Task SendOtpCodeAsync(string toEmail, string code, CancellationToken ct = default);
    Task SendContactNotificationAsync(string name, string email, string? phone, string message, CancellationToken ct = default);
}

/// Sends via Brevo's HTTPS transactional email API (not SMTP) since many PaaS hosts block/throttle outbound SMTP ports.
public class EmailService : IEmailService
{
    private readonly EmailOptions _options;
    private readonly HttpClient _httpClient;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailOptions> options, HttpClient httpClient, ILogger<EmailService> logger)
    {
        _options = options.Value;
        _httpClient = httpClient;
        _logger = logger;
    }

    public Task SendOtpCodeAsync(string toEmail, string code, CancellationToken ct = default)
    {
        return SendAsync(toEmail, "Your admin login code",
            $"<p>Your one-time verification code is:</p><h2>{code}</h2><p>This code expires in 5 minutes. If you did not request this, ignore this email.</p>", ct);
    }

    public Task SendContactNotificationAsync(string name, string email, string? phone, string message, CancellationToken ct = default)
    {
        return SendAsync(_options.AdminNotificationAddress, "New contact form submission",
            $"<p><strong>Name:</strong> {WebUtility(name)}</p>" +
            $"<p><strong>Email:</strong> {WebUtility(email)}</p>" +
            $"<p><strong>Phone:</strong> {WebUtility(phone ?? "-")}</p>" +
            $"<p><strong>Message:</strong><br/>{WebUtility(message)}</p>", ct);
    }

    private static string WebUtility(string value) => System.Net.WebUtility.HtmlEncode(value);

    private async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken ct)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email")
        {
            Content = JsonContent.Create(new
            {
                sender = new { name = _options.FromName, email = _options.FromAddress },
                to = new[] { new { email = toEmail } },
                subject,
                htmlContent = htmlBody
            })
        };
        request.Headers.TryAddWithoutValidation("api-key", _options.ApiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        try
        {
            var response = await _httpClient.SendAsync(request, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                throw new InvalidOperationException($"Brevo API returned {(int)response.StatusCode}: {body}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Recipient}", toEmail);
            throw;
        }
    }
}
