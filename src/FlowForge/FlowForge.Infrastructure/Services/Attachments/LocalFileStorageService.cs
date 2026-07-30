using FlowForge.Application.Services.Attachments;
using Microsoft.Extensions.Hosting;

namespace FlowForge.Infrastructure.Services.Attachments;

public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _rootPath;

    public LocalFileStorageService(IHostEnvironment environment)
    {
        _rootPath = Path.Combine(environment.ContentRootPath, "Storage", "Attachments");
    }

    public async Task<StoredFileResult> SaveAsync(Guid workItemId, FileUploadRequest file, CancellationToken cancellationToken = default)
    {
        var extension = Path.GetExtension(file.FileName);

        var storedFileName = $"{Guid.NewGuid():N}{extension}";

        var relativePath = Path.Combine(workItemId.ToString(), storedFileName);

        var absoluteDirectory = Path.Combine(_rootPath, workItemId.ToString());

        Directory.CreateDirectory(absoluteDirectory);

        var absolutePath = Path.Combine(absoluteDirectory, storedFileName);

        await using var output = new FileStream(absolutePath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true);

        await file.Content.CopyToAsync(output, cancellationToken);

        return new StoredFileResult
        {
            StoredFileName = storedFileName,
            StoragePath = relativePath
        };
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var absolutePath = GetAbsolutePath(storagePath);

        if (!File.Exists(absolutePath))
            throw new FileNotFoundException("Attachment file was not found.");

        Stream stream = new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read, 81920, useAsync: true);

        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var absolutePath = GetAbsolutePath(storagePath);

        if (File.Exists(absolutePath))
            File.Delete(absolutePath);

        return Task.CompletedTask;
    }

    private string GetAbsolutePath(string storagePath)
    {
        return Path.Combine(_rootPath, storagePath);
    }
}