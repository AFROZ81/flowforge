namespace FlowForge.Application.Services.Storage;

/// <summary>
/// Interface for file storage abstraction.
/// </summary>
public interface IFileStorageProvider
{
    /// <summary>
    /// Uploads a file and returns the storage key/URL.
    /// </summary>
    Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Downloads a file by its storage key.
    /// </summary>
    Task<Stream?> DownloadAsync(string storageKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file by its storage key.
    /// </summary>
    Task<bool> DeleteAsync(string storageKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a file exists.
    /// </summary>
    Task<bool> ExistsAsync(string storageKey, CancellationToken cancellationToken = default);

    /// <summary>
    /// Generates a pre-signed URL for direct upload/download.
    /// </summary>
    Task<string> GetPresignedUrlAsync(string storageKey, TimeSpan expiry, CancellationToken cancellationToken = default);
}