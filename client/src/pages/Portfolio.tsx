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
      .then((all) => setItems(all.filter((m) => !m.isHero && !m.isSlide && !m.isTestimonial)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-6 text-center bg-stone-50">
        <h1 className="font-serif text-5xl sm:text-7xl text-stone-900 tracking-tight mb-4">Portfolio</h1>
        <p className="text-stone-500 font-light tracking-wider">RAW, REAL, AND DEEPLY ROOTED.</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className={`text-sm tracking-[0.15em] uppercase font-light transition-colors pb-1 border-b ${
              selected === null ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelected(cat.id)}
              className={`text-sm tracking-[0.15em] uppercase font-light transition-colors pb-1 border-b ${
                selected === cat.id ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-stone-400 font-light">Loading...</p>
        ) : (
          <Gallery items={items} />
        )}
      </section>
    </div>
  );
}
