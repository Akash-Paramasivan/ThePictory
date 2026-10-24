import { useEffect, useState, type FormEvent } from 'react';
import imageCompression from 'browser-image-compression';
import {
  getGalleryData,
  uploadHeroImage,
  uploadGalleryImages,
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

  // Hero upload state
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);

  // Gallery bulk upload state
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

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHeroFile(e.target.files[0]);
    } else {
      setHeroFile(null);
    }
  };

  const handleHeroUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!heroFile) return;
    setHeroUploading(true);
    setHeroError(null);

    try {
      let processedFile = heroFile;
      try {
        const options = {
          maxSizeMB: 8,
          maxWidthOrHeight: 2560,
          initialQuality: 0.85,
          useWebWorker: true,
        };
        const compressed = await imageCompression(heroFile, options);
        processedFile = new File([compressed], heroFile.name, {
          type: compressed.type || heroFile.type,
          lastModified: Date.now(),
        });
      } catch {
        // use original if compression fails
      }

      const form = new FormData();
      form.append('file', processedFile);

      await uploadHeroImage(form);
      setHeroFile(null);
      const inputEl = document.getElementById('hero-file-input') as HTMLInputElement;
      if (inputEl) inputEl.value = '';

      await loadData();
    } catch (err) {
      setHeroError(err instanceof ApiError ? err.message : 'Hero upload failed.');
    } finally {
      setHeroUploading(false);
    }
  };

  const handleRemoveHero = async () => {
    if (!heroImage) return;
    if (!confirm('Remove current hero cover photo?')) return;
    try {
      await deleteGalleryItem(heroImage.id);
      await loadData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to remove hero cover.');
    }
  };

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

      {/* Card 1: Hero Cover Photo (Single Upload) */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-medium">Hero Cover Photo</h2>
          <p className="text-stone-500 text-sm mt-0.5">Upload a single full-width cover photo for the top of the /gallery page.</p>
        </div>

        {heroImage ? (
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={heroImage.imageUrl} alt={heroImage.title} className="w-32 h-20 object-cover rounded shadow-sm" />
              <div>
                <span className="text-xs uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Active Hero Cover</span>
                <p className="font-medium text-sm mt-1">{heroImage.title}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveHero}
              className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded font-medium transition"
            >
              Remove Hero
            </button>
          </div>
        ) : (
          <p className="text-stone-400 text-sm italic">No hero cover photo uploaded yet.</p>
        )}

        <form onSubmit={handleHeroUpload} className="space-y-4 pt-2 border-t border-stone-100">
          <div>
            <label className="block text-sm font-medium mb-1">Select New Hero Cover Photo</label>
            <input
              id="hero-file-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={handleHeroFileChange}
              className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
            />
          </div>

          {heroUploading && (
            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-medium text-neutral-900">Uploading hero cover...</p>
            </div>
          )}

          {heroError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{heroError}</p>}

          <button
            type="submit"
            disabled={heroUploading || !heroFile}
            className="rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-neutral-800 transition"
          >
            {heroUploading ? 'Uploading...' : 'Upload Hero Cover'}
          </button>
        </form>
      </div>

      {/* Card 2: Gallery Photos (Bulk Upload) */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-medium">Gallery Photos</h2>
          <p className="text-stone-500 text-sm mt-0.5">Bulk upload photos for the editorial masonry grid on the /gallery page.</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
              <div>
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <p className="font-medium truncate text-sm" title={photo.title}>{photo.title}</p>
                </div>
              </div>
              <div className="p-3 border-t border-neutral-100 flex justify-end bg-neutral-50">
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

      {/* Card 3: Client Testimonials Manager Section */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-medium">Client Testimonial Videos (YouTube)</h2>
          <p className="text-stone-500 text-sm mt-0.5">Add client story and couple testimonial videos.</p>
        </div>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
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