using Curio.Api.Models;
using Curio.Api.Storage;

var builder = WebApplication.CreateBuilder(args);

// Every page must be listed here — it doubles as the whitelist that keeps
// the {page} route parameter from being used to read/write arbitrary files.
var validPages = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "likes", "learn" };

var frontendOrigins = builder.Configuration
    .GetSection("FrontendOrigins")
    .Get<string[]>() ?? ["http://localhost:5173", "https://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.WithOrigins(frontendOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var dataDirectory = Path.Combine(builder.Environment.ContentRootPath, "Data");
builder.Services.AddSingleton(new JsonPageStore(dataDirectory));

var app = builder.Build();

app.UseCors("frontend");

var pages = app.MapGroup("/api/pages/{page}")
    .AddEndpointFilter(async (context, next) =>
    {
        var page = context.HttpContext.Request.RouteValues["page"]?.ToString() ?? string.Empty;
        if (!validPages.Contains(page))
        {
            return Results.NotFound(new { error = $"Unknown page '{page}'." });
        }
        return await next(context);
    });

pages.MapGet("/items", async (string page, JsonPageStore store) =>
    Results.Ok(await store.GetAllAsync(page)));

pages.MapPost("/items", async (string page, ItemInput input, JsonPageStore store) =>
{
    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return Results.BadRequest(new { error = "Title is required." });
    }
    var created = await store.CreateAsync(page, input);
    return Results.Created($"/api/pages/{page}/items/{created.Id}", created);
});

pages.MapPut("/items/{id}", async (string page, string id, ItemInput input, JsonPageStore store) =>
{
    if (string.IsNullOrWhiteSpace(input.Title))
    {
        return Results.BadRequest(new { error = "Title is required." });
    }
    var updated = await store.UpdateAsync(page, id, input);
    return updated is null ? Results.NotFound() : Results.Ok(updated);
});

pages.MapDelete("/items/{id}", async (string page, string id, JsonPageStore store) =>
{
    var deleted = await store.DeleteAsync(page, id);
    return deleted ? Results.NoContent() : Results.NotFound();
});

app.Run();
