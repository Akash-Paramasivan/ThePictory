using System.ComponentModel.DataAnnotations;

namespace ThePictory.Api.Dtos;

public record ContactSubmissionRequest(
    [Required, StringLength(150)] string Name,
    [Required, EmailAddress, StringLength(250)] string Email,
    [StringLength(30)] string? Phone,
    [Required, StringLength(3000)] string Message);

public record ContactSubmissionDto(
    int Id,
    string Name,
    string Email,
    string? Phone,
    string Message,
    DateTime SubmittedAt,
    bool IsRead);
