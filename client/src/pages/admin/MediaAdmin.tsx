import { useEffect, useState, type FormEvent } from 'react';
import imageCompression from 'browser-image-compression';
import { getCategories, type Category } from '../../api/categories';
import { deleteMedia, getMedia, updateMedia, uploadMedia, type MediaItem } from '../../api/media';
import { ApiError } from '../../api/client';

export default function MediaAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const load = () => getMedia().then(setItems).catch(() => setItems([]));

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    load();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0 || !categoryId) return;
    setUploading(true);
    setError(null);
    setUploadProgress('Compressing images...');

    try {
      const processedFiles: File[] = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(`Compressing image ${i + 1} of ${selectedFiles.length} (${file.name})...`);

        // Compress if > 10MB or to ensure high-res camera photos fit well under Cloudinary limits
        // Target max width 2560px, 85% quality as requested
        try {
          const options = {
            maxSizeMB: 8,
            maxWidthOrHeight: 2560,
            initialQuality: 0.85,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          const finalFile = new File([compressedFile], file.name, {
            type: compressedFile.type || file.type,
            lastModified: Date.now(),
          });
          processedFiles.push(finalFile);
        } catch (compressionErr) {
          console.warn('Compression failed for file, using original:', compressionErr);
          processedFiles.push(file);
        }
      }

      setUploadProgress(`Uploading ${processedFiles.length} photo(s) to Cloudinary...`);

      const form = new FormData();
      form.append('categoryId', String(categoryId));
      if (title.trim()) {
        form.append('title', title);
      }
      if (description.trim()) {
        form.append('description', description);
      }

      processedFiles.forEach((f) => {
        form.append('files', f);
      });

      await uploadMedia(form);

      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const toggleFeatured = async (item: MediaItem) => {
    await updateMedia(item.id, {
      categoryId: item.categoryId,
      title: item.title,
      description: item.description ?? undefined,
      sortOrder: item.sortOrder,
      isFeatured: !item.isFeatured,
      isSlide: item.isSlide,
      slideOrder: item.slideOrder,
      isHero: item.isHero,
      isTestimonial: item.isTestimonial,
    });
    await load();
  };

  const toggleSlide = async (item: MediaItem) => {
    const nextSlide = !item.isSlide;
    await updateMedia(item.id, {
      categoryId: item.categoryId,
      title: item.title,
      description: item.description ?? undefined,
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      isSlide: nextSlide,
      slideOrder: nextSlide ? (item.slideOrder || 1) : 0,
      isHero: item.isHero,
      isTestimonial: item.isTestimonial,
    });
    await load();
  };

  const toggleHero = async (item: MediaItem) => {
    await updateMedia(item.id, {
      categoryId: item.categoryId,
      title: item.title,
      description: item.description ?? undefined,
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      isSlide: item.isSlide,
      slideOrder: item.slideOrder,
      isHero: !item.isHero,
      isTestimonial: item.isTestimonial,
    });
    await load();
  };

  const toggleTestimonial = async (item: MediaItem) => {
    await updateMedia(item.id, {
      categoryId: item.categoryId,
      title: item.title,
      description: item.description ?? undefined,
      sortOrder: item.sortOrder,
      isFeatured: item.isFeatured,
      isSlide: item.isSlide,
      slideOrder: item.slideOrder,
      isHero: item.isHero,
      isTestimonial: !item.isTestimonial,
    });
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this photo?')) return;
    await deleteMedia(id);
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Portfolio Media</h1>

      <form onSubmit={handleUpload} className="grid gap-4 sm:grid-cols-2 mb-8 bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 bg-white"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Title {selectedFiles.length > 1 ? '(Optional for multiple)' : ''}</label>
          <input
            required={selectedFiles.length <= 1}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={selectedFiles.length > 1 ? 'Will use filenames if empty' : 'Photo title'}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Shared description for uploaded photos"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Photos (JPEG/PNG/WEBP, supports multiple high-res camera images)</label>
          <input
            id="media-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onChange={handleFileChange}
            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
          />
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-sm font-medium text-neutral-700">
              {selectedFiles.length} photo{selectedFiles.length === 1 ? '' : 's'} selected
            </p>
          )}
        </div>

        {uploading && (
          <div className="sm:col-span-2 bg-neutral-50 p-4 rounded-md border border-neutral-200 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{uploadProgress}</p>
              <p className="text-xs text-neutral-500">High-resolution images are automatically optimized before upload.</p>
            </div>
          </div>
        )}

        {error && <p className="text-red-600 text-sm sm:col-span-2 bg-red-50 p-3 rounded-md">{error}</p>}

        <button
          type="submit"
          disabled={uploading || selectedFiles.length === 0}
          className="sm:col-span-2 rounded-md bg-neutral-900 text-white px-6 py-2.5 text-sm font-medium disabled:opacity-50 w-fit hover:bg-neutral-800 transition"
        >
          {uploading ? 'Processing & Uploading...' : `Upload ${selectedFiles.length > 1 ? `${selectedFiles.length} Photos` : 'Photo'}`}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <img src={item.cloudinaryUrl} alt={item.title} className="w-full h-40 object-cover" />
              <div className="p-3">
                <p className="font-medium truncate text-sm" title={item.title}>{item.title}</p>
                <p className="text-neutral-400 text-xs mt-0.5">{item.categoryName}</p>
              </div>
            </div>
            <div className="px-3 pb-3 pt-1 border-t border-neutral-100 flex flex-wrap justify-between items-center gap-1.5 bg-neutral-50/50">
              <button type="button" onClick={() => toggleFeatured(item)} className={`text-xs px-2 py-1 rounded ${item.isFeatured ? 'bg-amber-100 text-amber-800 font-medium' : 'text-neutral-600 hover:bg-neutral-200/60'}`}>
                {item.isFeatured ? 'Featured' : 'Feature'}
              </button>
              <button type="button" onClick={() => toggleSlide(item)} className={`text-xs px-2 py-1 rounded ${item.isSlide ? 'bg-blue-100 text-blue-800 font-medium' : 'text-neutral-600 hover:bg-neutral-200/60'}`}>
                {item.isSlide ? 'Slide' : '+Slide'}
              </button>
              <button type="button" onClick={() => toggleHero(item)} className={`text-xs px-2 py-1 rounded ${item.isHero ? 'bg-purple-100 text-purple-800 font-medium' : 'text-neutral-600 hover:bg-neutral-200/60'}`}>
                {item.isHero ? 'Hero' : '+Hero'}
              </button>
              <button type="button" onClick={() => toggleTestimonial(item)} className={`text-xs px-2 py-1 rounded ${item.isTestimonial ? 'bg-green-100 text-green-800 font-medium' : 'text-neutral-600 hover:bg-neutral-200/60'}`}>
                {item.isTestimonial ? 'Testimonial' : '+Testimonial'}
              </button>
              <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 ml-auto">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-neutral-500 text-sm py-8 text-center bg-white rounded-lg border border-neutral-200">No photos uploaded yet.</p>}
    </div>
  );
}
