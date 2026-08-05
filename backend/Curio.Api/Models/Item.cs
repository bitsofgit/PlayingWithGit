namespace Curio.Api.Models;

public record Item(
    string Id,
    string Title,
    string Note,
    string Url,
    string? Status,
    DateTimeOffset CreatedAt
);

public record ItemInput(
    string Title,
    string? Note,
    string? Url,
    string? Status
);
