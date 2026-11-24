using FlowForge.Application.Services.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FlowForge.Infrastructure.Services.Storage;

/// <summary>
/// Azure Blob Storage implementation.
/// </summary>
public sealed class AzureBlobStorageService : IFileStorageProvider
{
    private readonly BlobContainerClient _containerClient;
    private readonly ILogger<AzureBlobStorageService> _logger;

    public AzureBlobStorageService(
        IOptions<AzureBlobStorageOptions> options,
        ILogger<AzureBlobStorageService> logger)
    {
        var optionsValue = options.Value;
        _containerClient = new BlobContainerClient(
            optionsValue.ConnectionString,
            optionsValue.ContainerName);
        _logger = logger;

        _containerClient.CreateIfNotExists(PublicAccessType.None);
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var storageKey = $"{Guid.NewGuid()}_{fileName}";
        var blobClient = _containerClient.GetBlobClient(storageKey);

        var headers = new BlobHttpHeaders { ContentType = contentType };
        await blobClient.UploadAsync(
            stream,
            headers,
            metadata: null,
            conditions: null,
            progressHandler: null,
            cancellationToken: cancellationToken);

        _logger.LogInformation("Uploaded file {StorageKey} to Azure Blob Storage", storageKey);

        return storageKey;
    }

    public async Task<Stream?> DownloadAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(storageKey);

        if (!await blobClient.ExistsAsync(cancellationToken))
        {
            return null;
        }

        var memoryStream = new MemoryStream();
        await blobClient.DownloadToAsync(memoryStream, cancellationToken);
        memoryStream.Position = 0;

        return memoryStream;
    }

    public async Task<bool> DeleteAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(storageKey);

        var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: cancellationToken);

        if (response.Value)
        {
            _logger.LogInformation("Deleted file {StorageKey} from Azure Blob Storage", storageKey);
            return true;
        }

        return false;
    }

    public async Task<bool> ExistsAsync(string storageKey, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(storageKey);
        var response = await blobClient.ExistsAsync(cancellationToken);
        return response.Value;
    }

    public async Task<string> GetPresignedUrlAsync(string storageKey, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        var blobClient = _containerClient.GetBlobClient(storageKey);

        if (!await blobClient.ExistsAsync(cancellationToken))
        {
            throw new FileNotFoundException("File not found", storageKey);
        }

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerClient.Name,
            BlobName = storageKey,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.Add(expiry)
        };

        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        var sasToken = sasBuilder.ToSasQueryParameters(
            new Azure.Storage.StorageSharedKeyCredential(
                _containerClient.AccountName,
                // Need to parse connection string for account key
                // This is simplified - in production use proper credential management
                GetAccountKeyFromConnectionString()));

        return await Task.FromResult($"{blobClient.Uri}?{sasToken}");
    }

    private string GetAccountKeyFromConnectionString()
    {
        // Simplified - in production use proper configuration
        var connectionString = _containerClient.Uri.ToString();
        // Parse connection string for account key
        // This is a placeholder implementation
        return "account-key-placeholder";
    }
}

/// <summary>
/// Configuration options for Azure Blob Storage.
/// </summary>
public sealed class AzureBlobStorageOptions
{
    public string ConnectionString { get; init; } = string.Empty;
    public string ContainerName { get; init; } = "attachments";
}