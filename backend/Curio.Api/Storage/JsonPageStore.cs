using System.Text.Json;
using Curio.Api.Models;

namespace Curio.Api.Storage;

/// <summary>
/// Persists each "page" (e.g. likes, learn) as its own JSON array file.
/// A simple file per page is enough for a single-user app; swap this
/// out for a real database later without touching the API surface.
/// </summary>
public class JsonPageStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly string _dataDirectory;
    private readonly SemaphoreSlim _lock = new(1, 1);

    public JsonPageStore(string dataDirectory)
    {
        _dataDirectory = dataDirectory;
        Directory.CreateDirectory(_dataDirectory);
    }

    private string PathFor(string page) => Path.Combine(_dataDirectory, $"{page.ToLowerInvariant()}.json");

    public async Task<List<Item>> GetAllAsync(string page)
    {
        await _lock.WaitAsync();
        try
        {
            return await ReadAsync(page);
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Item> CreateAsync(string page, ItemInput input)
    {
        await _lock.WaitAsync();
        try
        {
            var items = await ReadAsync(page);
            var item = new Item(
                Guid.NewGuid().ToString("n"),
                input.Title.Trim(),
                input.Note?.Trim() ?? string.Empty,
                input.Url?.Trim() ?? string.Empty,
                string.IsNullOrWhiteSpace(input.Status) ? null : input.Status,
                DateTimeOffset.UtcNow
            );
            items.Insert(0, item);
            await WriteAsync(page, items);
            return item;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<Item?> UpdateAsync(string page, string id, ItemInput input)
    {
        await _lock.WaitAsync();
        try
        {
            var items = await ReadAsync(page);
            var index = items.FindIndex(i => i.Id == id);
            if (index == -1) return null;

            var existing = items[index];
            var updated = existing with
            {
                Title = input.Title.Trim(),
                Note = input.Note?.Trim() ?? string.Empty,
                Url = input.Url?.Trim() ?? string.Empty,
                Status = string.IsNullOrWhiteSpace(input.Status) ? null : input.Status,
            };
            items[index] = updated;
            await WriteAsync(page, items);
            return updated;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task<bool> DeleteAsync(string page, string id)
    {
        await _lock.WaitAsync();
        try
        {
            var items = await ReadAsync(page);
            var removed = items.RemoveAll(i => i.Id == id) > 0;
            if (removed) await WriteAsync(page, items);
            return removed;
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task<List<Item>> ReadAsync(string page)
    {
        var path = PathFor(page);
        if (!File.Exists(path)) return [];

        await using var stream = File.OpenRead(path);
        var items = await JsonSerializer.DeserializeAsync<List<Item>>(stream, JsonOptions);
        return items ?? [];
    }

    private async Task WriteAsync(string page, List<Item> items)
    {
        var path = PathFor(page);
        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, items, JsonOptions);
    }
}
