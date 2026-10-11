import { useState } from 'react';
import type { MediaItem } from '../api/media';
import SmartImage from './SmartImage';

export default function Gallery({ items }: { items: MediaItem[] }) {
  const [active, setActive] = useState<MediaItem | null>(null);

  if (items.length === 0) {
    return <p className="text-charcoal-soft text-center py-16">No photos in this category yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="block w-full aspect-[4/5] overflow-hidden group focus:outline-none"
          >
            <SmartImage
              src={item.cloudinaryUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-charcoal/95 flex items-center justify-center p-4"
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
          <SmartImage
            src={active.cloudinaryUrl}
            alt={active.title}
            className="max-h-[90vh] max-w-full object-contain"
            shimmerClassName="w-[60vw] h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
