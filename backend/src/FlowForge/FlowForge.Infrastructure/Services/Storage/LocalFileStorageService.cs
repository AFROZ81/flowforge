using FlowForge.Application.Services.Storage;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FlowForge.Infrastructure.Services.Storage;

/// <summary>
/// Local file storage implementation.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageProvider
{
    private readonly string _basePath;
    private readonly ILogger<LocalFileStorageService> _logger;

    public LocalFileStorageService(
        IOptions<LocalFileStorageOptions> options,
        ILogger<LocalFileStorageService> logger)
    {
        _basePath = options.Value.BasePath;
        _logger = logger;

        if (!Directory.Exists(_basePath))
        {
            Directory.CreateDirectory(_basePath);
        }
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var storageKey = $"{Guid.NewGuid()}_{fileName}";
        var filePath = Path.Combine(_basePath, storageKey);

        using var fileStream = File.Create(filePath);
        await stream.CopyToAsync(fileStream, cancellationToken);

        _logger.LogInformation("Uploaded file {StorageKey} to local storage", storageKey);

        return storageKey;
    }

    public async Task<Stream?> DownloadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_basePath, storageKey);

        if (!File.Exists(filePath))
        {
            return null;
        }

        var memoryStream = new MemoryStream();
        using var fileStream = File.OpenRead(filePath);
        await fileStream.CopyToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public async Task<bool> DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_basePath, storageKey);

        if (!File.Exists(filePath))
        {
            return false;
        }

        await Task.Run(() => File.Delete(filePath), cancellationToken);
        _logger.LogInformation("Deleted file {StorageKey} from local storage", storageKey);

        return true;
    }

    public async Task<bool> ExistsAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_basePath, storageKey);
        return await Task.FromResult(File.Exists(filePath));
    }

    public async Task<string> GetPresignedUrlAsync(string storageKey, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        var filePath = Path.Combine(_basePath, storageKey);

        if (!File.Exists(filePath))
        {
            throw new FileNotFoundException("File not found", storageKey);
        }

        // For local storage, return a file:// URL or a custom endpoint
        // In production, this would be a proper signed URL
        return await Task.FromResult($"file://{filePath}");
    }
}

/// <summary>
/// Configuration options for local file storage.
/// </summary>
public sealed class LocalFileStorageOptions
{
    public string BasePath { get; init; } = "Storage/Attachments";
}