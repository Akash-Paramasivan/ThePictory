import { useEffect, useState, type FormEvent } from 'react';
import imageCompression from 'browser-image-compression';
import {
  getGalleryData,
  uploadGalleryImages,
  setGalleryCover,
  deleteGalleryItem,
  getTestimonials,
  addTestimonial,
  deleteTestimonial,
  type GalleryItem,
  type TestimonialVideo,
} from '../../api/gallery';
import { ApiError } from '../../api/client';

export default function GalleryAdmin() {
  const [heroImage, setHeroImage] = useState<GalleryItem | null>(null);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialVideo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Testimonial form state
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [testimonialLoading, setTestimonialLoading] = useState(false);
  const [testimonialError, setTestimonialError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getGalleryData();
      setHeroImage(data.heroImage);
      setPhotos(data.photos);
      const testData = await getTestimonials();
      setTestimonials(testData);
    } catch {
      setPhotos([]);
      setTestimonials([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setError(null);
    setUploadProgress('Compressing images...');

    try {
      const processedFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Compressing image ${i + 1} of ${selectedFiles.length} (${file.name})...`);
        try {
          const options = {
            maxSizeMB: 8,
            maxWidthOrHeight: 2560,
            initialQuality: 0.85,
            useWebWorker: true,
          };
          const compressed = await imageCompression(file, options);
          processedFiles.push(
            new File([compressed], file.name, {
              type: compressed.type || file.type,
              lastModified: Date.now(),
            })
          );
        } catch {
          processedFiles.push(file);
        }
      }

      setUploadProgress(`Uploading ${processedFiles.length} photo(s) to Gallery...`);
      const form = new FormData();
      processedFiles.forEach((f) => form.append('files', f));

      await uploadGalleryImages(form);
      setSelectedFiles([]);
      const fileInput = document.getElementById('gallery-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleSetCover = async (id: number) => {
    try {
      await setGalleryCover(id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to set cover.');
    }
  };

  const handleDeletePhoto = async (id: number) => {
    if (!confirm('Delete this photo from Gallery?')) return;
    try {
      await deleteGalleryItem(id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete photo.');
    }
  };

  const handleAddTestimonial = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!youTubeUrl.trim()) return;
    setTestimonialLoading(true);
    setTestimonialError(null);

    try {
      await addTestimonial({
        youTubeUrl: youTubeUrl.trim(),
        coupleName: coupleName.trim() || undefined,
        weddingDate: weddingDate ? new Date(weddingDate).toISOString() : undefined,
      });
      setYouTubeUrl('');
      setCoupleName('');
      setWeddingDate('');
      await loadData();
    } catch (err) {
      setTestimonialError(err instanceof ApiError ? err.message : 'Failed to add testimonial.');
    } finally {
      setTestimonialLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm('Delete this testimonial video?')) return;
    try {
      await deleteTestimonial(id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to delete testimonial.');
    }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Gallery & Testimonials Manager</h1>
        <p className="text-stone-500 text-sm">Manage the standalone editorial gallery at `/gallery` and client video stories.</p>
      </div>

      {/* Gallery Bulk Upload & Cover Section */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-lg font-medium">Gallery Photos & Hero Cover</h2>

        {heroImage && (
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={heroImage.imageUrl} alt={heroImage.title} className="w-24 h-16 object-cover rounded" />
              <div>
                <span className="text-xs uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Current Hero Cover</span>
                <p className="font-medium text-sm mt-1">{heroImage.title}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bulk Upload Gallery Photos</label>
            <input
              id="gallery-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required
              onChange={handleFileChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
            />
            {selectedFiles.length > 0 && (
              <p className="mt-2 text-sm font-medium text-neutral-700">{selectedFiles.length} photo(s) selected.</p>
            )}
          </div>

          {uploading && (
            <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-neutral-900">{uploadProgress}</p>
            </div>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</p>}

          <button
            type="submit"
            disabled={uploading || selectedFiles.length === 0}
            className="rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-neutral-800 transition"
          >
            {uploading ? 'Uploading...' : 'Upload to Gallery'}
          </button>
        </form>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="font-medium truncate text-sm" title={photo.title}>{photo.title}</p>
                </div>
              </div>
              <div className="p-3 border-t border-neutral-100 flex items-center justify-between bg-neutral-50">
                <button
                  type="button"
                  onClick={() => handleSetCover(photo.id)}
                  className="text-xs px-2.5 py-1 bg-stone-200 hover:bg-stone-300 rounded text-stone-800 font-medium"
                >
                  Set as Hero Cover
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        {photos.length === 0 && <p className="text-stone-400 text-sm py-4 text-center">No gallery photos added yet.</p>}
      </div>

      {/* Testimonials Manager Section */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-lg font-medium">Client Testimonial Videos (YouTube)</h2>

        <form onSubmit={handleAddTestimonial} className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">YouTube URL (e.g. https://youtu.be/... or watch?v=...)</label>
            <input
              required
              value={youTubeUrl}
              onChange={(e) => setYouTubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Couple Name (optional)</label>
            <input
              value={coupleName}
              onChange={(e) => setCoupleName(e.target.value)}
              placeholder="Sarah & Alex"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Wedding Date (optional)</label>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>

          {testimonialError && <p className="text-red-600 text-sm sm:col-span-3 bg-red-50 p-3 rounded-md">{testimonialError}</p>}

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={testimonialLoading}
              className="rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-neutral-800 transition"
            >
              {testimonialLoading ? 'Adding...' : 'Add Testimonial Video'}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
          {testimonials.map((test) => (
            <div key={test.id} className="bg-stone-50 rounded-lg border border-stone-200 p-4 flex flex-col justify-between">
              <div>
                <p className="font-medium text-stone-900 text-sm">{test.coupleName || 'Testimonial Video'}</p>
                <p className="text-xs text-stone-400 truncate mt-1">{test.youTubeUrl}</p>
                {test.weddingDate && (
                  <p className="text-xs text-stone-500 mt-1">{new Date(test.weddingDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDeleteTestimonial(test.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete Video
                </button>
              </div>
            </div>
          ))}
        </div>
        {testimonials.length === 0 && <p className="text-stone-400 text-sm py-4 text-center">No testimonial videos added yet.</p>}
      </div>
    </div>
  );
}