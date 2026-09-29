namespace ThePictory.Api.Dtos;

public record CategoryDto(int Id, string Name, int SortOrder);
public record CreateCategoryRequest(string Name, int SortOrder);
public record UpdateCategoryRequest(string Name, int SortOrder);
