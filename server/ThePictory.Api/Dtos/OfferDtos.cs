using ThePictory.Api.Models;

namespace ThePictory.Api.Dtos;

public record OfferDto(
    int Id,
    string Title,
    string? Description,
    OfferMediaType MediaType,
    string? ImageUrl,
    string? YouTubeUrl,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate);

public record CreateOfferRequest(
    string Title,
    string? Description,
    OfferMediaType MediaType,
    string? YouTubeUrl,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate);

public record UpdateOfferRequest(
    string Title,
    string? Description,
    bool IsActive,
    DateTime? StartDate,
    DateTime? EndDate);
