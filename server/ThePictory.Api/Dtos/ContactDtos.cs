using System.ComponentModel.DataAnnotations;

namespace ThePictory.Api.Dtos;

public record ContactSubmissionRequest(
    [Required, StringLength(100)] string EventType,
    [Required, StringLength(50)] string PhotographyDays,
    [Required, StringLength(50)] string Budget,
    [Required, StringLength(150)] string FullName,
    [Required, StringLength(10)] string WhatsAppCountryCode,
    [Required, StringLength(20)] string WhatsAppNumber);

public record ContactSubmissionDto(
    int Id,
    string EventType,
    string PhotographyDays,
    string Budget,
    string FullName,
    string WhatsAppCountryCode,
    string WhatsAppNumber,
    DateTime SubmittedAt,
    bool IsRead);
