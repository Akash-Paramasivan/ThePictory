using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Options;
using ThePictory.Api.Options;

namespace ThePictory.Api.Services;

public interface ICloudinaryService
{
    Task<(string Url, string PublicId)> UploadImageAsync(Stream fileStream, string fileName, CancellationToken ct = default);
    Task DeleteImageAsync(string publicId, CancellationToken ct = default);
}

public class CloudinaryService : ICloudinaryService
{
    private readonly Lazy<Cloudinary> _cloudinary;

    public CloudinaryService(IOptions<CloudinaryOptions> options)
    {
        // Lazy so controllers that don't touch upload/delete still work when Cloudinary isn't configured yet (e.g. local dev).
        _cloudinary = new Lazy<Cloudinary>(() =>
        {
            var o = options.Value;
            var client = new Cloudinary(new Account(o.CloudName, o.ApiKey, o.ApiSecret));
            client.Api.Secure = true;
            return client;
        });
    }

    public async Task<(string Url, string PublicId)> UploadImageAsync(Stream fileStream, string fileName, CancellationToken ct = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = "thepictory",
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };

        var result = await _cloudinary.Value.UploadAsync(uploadParams, ct);
        if (result.Error is not null)
        {
            throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");
        }

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteImageAsync(string publicId, CancellationToken ct = default)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.Value.DestroyAsync(deleteParams);
    }
}
