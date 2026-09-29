import { useState } from 'react';
import type { MediaItem } from '../api/media';

export default function Gallery({ items }: { items: MediaItem[] }) {
  const [active, setActive] = useState<MediaItem | null>(null);

  if (items.length === 0) {
    return <p className="text-neutral-500 text-center py-16">No photos in this category yet.</p>;
  }

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="block w-full break-inside-avoid overflow-hidden rounded-lg group focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <img
              src={item.cloudinaryUrl}
              alt={item.title}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-3xl leading-none"
            aria-label="Close"
            onClick={() => setActive(null)}
          >
            &times;
          </button>
          <img
            src={active.cloudinaryUrl}
            alt={active.title}
            className="max-h-[90vh] max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
