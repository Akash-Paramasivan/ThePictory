import { useEffect, useState, type FormEvent } from 'react';
import { getCategories, type Category } from '../../api/categories';
import { deleteMedia, getMedia, updateMedia, uploadMedia, type MediaItem } from '../../api/media';
import { ApiError } from '../../api/client';

export default function MediaAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => getMedia().then(setItems).catch(() => setItems([]));

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    load();
  }, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !categoryId) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('categoryId', String(categoryId));
      form.append('title', title);
      if (description) form.append('description', description);
      await uploadMedia(form);
      setTitle('');
      setDescription('');
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const toggleFeatured = async (item: MediaItem) => {
    await updateMedia(item.id, {
      categoryId: item.categoryId,
      title: item.title,
      description: item.description ?? undefined,
      sortOrder: item.sortOrder,
      isFeatured: !item.isFeatured,
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

      <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-2 mb-8 bg-white p-4 rounded-lg border border-neutral-200">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
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
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Photo (JPEG/PNG/WEBP, max 10MB)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>
        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        <button
          type="submit"
          disabled={uploading}
          className="sm:col-span-2 rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 w-fit"
        >
          {uploading ? 'Uploading...' : 'Upload photo'}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <img src={item.cloudinaryUrl} alt={item.title} className="w-full h-36 object-cover" />
            <div className="p-2 text-sm">
              <p className="font-medium truncate">{item.title}</p>
              <p className="text-neutral-400 text-xs">{item.categoryName}</p>
              <div className="flex justify-between items-center mt-2">
                <button type="button" onClick={() => toggleFeatured(item)} className="text-xs text-neutral-600 hover:underline">
                  {item.isFeatured ? 'Unfeature' : 'Feature'}
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {items.length === 0 && <p className="text-neutral-500 text-sm">No photos uploaded yet.</p>}
    </div>
  );
}
