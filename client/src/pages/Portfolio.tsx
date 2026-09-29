import { useEffect, useState } from 'react';
import { getCategories, type Category } from '../api/categories';
import { getMedia, type MediaItem } from '../api/media';
import Gallery from '../components/Gallery';

export default function Portfolio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getMedia(selected ? { categoryId: selected } : undefined)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-semibold mb-6">Portfolio</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
            selected === null ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelected(cat.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
              selected === cat.id ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-300 text-neutral-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? <p className="text-neutral-500">Loading...</p> : <Gallery items={items} />}
    </div>
  );
}
