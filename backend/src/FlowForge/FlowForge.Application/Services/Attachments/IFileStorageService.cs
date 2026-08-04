namespace FlowForge.Application.Services.Attachments;

public interface IFileStorageService
{
    Task<StoredFileResult> SaveAsync(Guid workItemId, FileUploadRequest file, CancellationToken cancellationToken = default);

    Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default);

    Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
}