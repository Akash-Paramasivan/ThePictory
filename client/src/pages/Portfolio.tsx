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
    <div className="py-16">
      <h1 className="font-serif text-4xl sm:text-5xl text-center text-charcoal mb-10">Portfolio</h1>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-12 px-4">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className={`text-xs uppercase tracking-[0.15em] pb-1 border-b ${
            selected === null ? 'text-charcoal border-charcoal' : 'text-charcoal-soft border-transparent hover:text-charcoal'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelected(cat.id)}
            className={`text-xs uppercase tracking-[0.15em] pb-1 border-b ${
              selected === cat.id ? 'text-charcoal border-charcoal' : 'text-charcoal-soft border-transparent hover:text-charcoal'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? <p className="text-center text-charcoal-soft">Loading...</p> : <Gallery items={items} />}
    </div>
  );
}
