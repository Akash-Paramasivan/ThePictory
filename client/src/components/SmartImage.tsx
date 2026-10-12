import { useState, type MouseEventHandler } from 'react';

/**
 * URLs that have already finished loading. Kept at module level so a
 * re-render (or navigating between pages) doesn't re-show the shimmer
 * for an image the browser already has cached.
 */
const loadedUrls = new Set<string>();

export default function SmartImage({
  src,
  alt,
  className,
  shimmerClassName,
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  /** Shown while the image is loading; defaults to the same class as `className`. */
  shimmerClassName?: string;
  onClick?: MouseEventHandler<HTMLImageElement>;
}) {
  const [loaded, setLoaded] = useState(() => loadedUrls.has(src));

  const handleLoad = () => {
    loadedUrls.add(src);
    setLoaded(true);
  };

  // While loading, keep a hidden <img> mounted so the resource actually
  // starts downloading (a shimmer-only render would never fire onLoad).
  // display:none images still load — we just skip lazy-loading on it.
  if (!loaded) {
    return (
      <>
        <img src={src} alt={alt} onLoad={handleLoad} className="hidden" aria-hidden="true" />
        <div
          className={`shimmer ${shimmerClassName ?? className ?? 'w-full h-full'}`}
          role="presentation"
        />
      </>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onLoad={handleLoad}
      loading="lazy"
      className={className}
      onClick={onClick}
    />
  );
}
