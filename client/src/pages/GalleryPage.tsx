import { useEffect, useState, useCallback, useRef } from 'react';
import { getGalleryData, type GalleryItem, type TestimonialVideo } from '../api/gallery';

function extractYouTubeId(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,20})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : '';
}

function getYouTubeEmbedUrl(url: string): string {
  const id = extractYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0` : '';
}

export default function GalleryPage() {
  const [heroImage, setHeroImage] = useState<GalleryItem | null>(null);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Lightbox extra controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<Record<number, boolean>>({});
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    let ignore = false;
    getGalleryData()
      .then((data) => {
        if (!ignore) {
          setHeroImage(data.heroImage);
          setPhotos(data.photos);
          setTestimonials(data.testimonials);
        }
      })
      .catch(() => {
        if (!ignore) {
          setHeroImage(null);
          setPhotos([]);
          setTestimonials([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev > 0 ? prev - 1 : photos.length - 1;
    });
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return prev < photos.length - 1 ? prev + 1 : 0;
    });
  }, [photos.length]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || lightboxIndex === null || photos.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(interval);
  }, [isPlaying, lightboxIndex, photos.length, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setLightboxIndex(null);
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handlePrev, handleNext]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Ensure horizontal swipe is dominant and exceeds threshold
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const scrollToGrid = () => {
    document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (photo: GalleryItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title || 'The Pictory Gallery',
          url: photo.imageUrl,
        });
        return;
      } catch {
        // Fallback to copy URL
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(photo.imageUrl);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Cover / Hero Section */}
      <section className="relative h-[85vh] min-h-[31.25rem] w-full overflow-hidden bg-stone-900">
        {heroImage ? (
          <img
            src={heroImage.imageUrl}
            alt={heroImage.title || 'The Pictory Gallery Cover'}
            className="w-full h-full object-cover"
          />
        ) : photos.length > 0 ? (
          <img
            src={photos[0].imageUrl}
            alt={photos[0].title || 'The Pictory Gallery Cover'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-stone-800" />
        )}

        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Brand title: lower left */}
        <div className="absolute bottom-8 left-6 sm:bottom-12 sm:left-12 z-10">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-white tracking-tight drop-shadow-sm font-normal">
            The Pictory
          </h1>
        </div>

        {/* Action: Bottom right outline pill button */}
        <div className="absolute bottom-8 right-6 sm:bottom-12 sm:right-12 z-10">
          <button
            type="button"
            onClick={scrollToGrid}
            className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-full border border-white text-white text-xs sm:text-sm tracking-widest uppercase font-light hover:bg-white hover:text-stone-900 transition-colors duration-300 shadow-sm"
          >
            View Gallery
          </button>
        </div>
      </section>

      {/* 2. Masonry Photo Grid */}
      <section id="gallery-grid" className="bg-white py-12 px-2 sm:px-4 md:px-6">
        {photos.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-stone-400 font-light">Gallery coming soon.</p>
          </div>
        ) : (
          /* Masonry column layout with 2-4px gutter (gap-1) */
          <div className="columns-2 md:columns-3 lg:columns-4 gap-1 space-y-1">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => {
                  setLightboxIndex(index);
                  setIsPlaying(false);
                }}
                className="break-inside-avoid overflow-hidden cursor-pointer group"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title || 'Gallery image'}
                  loading="lazy"
                  className="w-full h-auto block transition-opacity duration-300 hover:opacity-95"
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Client Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-20 px-6 bg-stone-50 border-t border-stone-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl text-stone-900 tracking-tight mb-2">
                What Our Couples Say
              </h2>
              <p className="text-stone-500 font-light tracking-wider text-xs uppercase">
                Client Stories & Memories
              </p>
            </div>

            <div
              className={`grid gap-8 justify-center items-stretch ${
                testimonials.length === 1
                  ? 'max-w-3xl mx-auto grid-cols-1'
                  : testimonials.length === 2
                  ? 'max-w-4xl mx-auto grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {testimonials.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-stone-200/60 flex flex-col"
                >
                  <div className="aspect-video w-full bg-stone-900">
                    <iframe
                      src={getYouTubeEmbedUrl(video.youTubeUrl)}
                      title={video.coupleName ? `${video.coupleName} Testimonial` : 'Wedding Testimonial'}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  {video.coupleName && (
                    <div className="p-4 flex-1 flex flex-col justify-center">
                      <p className="font-medium text-stone-900 text-sm tracking-wide">
                        {video.coupleName}
                      </p>
                      {video.weddingDate && (
                        <p className="text-xs text-stone-400 mt-0.5">
                          {new Date(video.weddingDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. High-End Lightbox (Full Single-Image Modal) */}
      {lightboxIndex !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-white flex flex-col justify-between select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Header Bar */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-stone-100 z-20">
            {/* Top-left: Back arrow icon to close */}
            <button
              type="button"
              onClick={() => {
                setLightboxIndex(null);
                setIsPlaying(false);
              }}
              className="text-stone-700 hover:text-stone-950 p-2 -ml-2 rounded-full transition-colors flex items-center justify-center text-xl"
              aria-label="Back to gallery"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            {/* Center: Image title or filename in subtle grey text */}
            <div className="text-center px-4 truncate max-w-[50vw]">
              <span className="text-xs tracking-wider uppercase text-stone-400 font-light truncate block">
                {currentPhoto.title || `Photo ${lightboxIndex + 1} of ${photos.length}`}
              </span>
            </div>

            {/* Top-right: Minimalist icons for Favorite, Share, and Slideshow/Play */}
            <div className="flex items-center gap-3 sm:gap-4 -mr-2">
              {/* Slideshow / Play toggle */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-full transition-colors ${
                  isPlaying ? 'text-stone-900 bg-stone-100' : 'text-stone-600 hover:text-stone-900'
                }`}
                title={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                aria-label={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Share icon */}
              <button
                type="button"
                onClick={() => handleShare(currentPhoto)}
                className="text-stone-600 hover:text-stone-900 p-2 rounded-full transition-colors"
                title="Share photo"
                aria-label="Share"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
              </button>

              {/* Favorite icon */}
              <button
                type="button"
                onClick={() => toggleFavorite(currentPhoto.id)}
                className={`p-2 rounded-full transition-colors ${
                  favorites[currentPhoto.id] ? 'text-red-500' : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Favorite"
                aria-label="Favorite"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill={favorites[currentPhoto.id] ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Copied toast notification */}
          {copiedNotification && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-stone-900 text-white text-xs px-4 py-2 rounded-full shadow-lg">
              Photo link copied to clipboard
            </div>
          )}

          {/* Main Stage: Photo Display and Desktop Nav Arrows */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden">
            {/* Desktop Navigation: Sleek left arrow button */}
            <button
              type="button"
              onClick={handlePrev}
              className="hidden sm:flex absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-stone-100/70 hover:bg-stone-200/90 text-stone-700 hover:text-stone-950 items-center justify-center transition-all duration-200"
              aria-label="Previous photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* High-res Image */}
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={currentPhoto.imageUrl}
                alt={currentPhoto.title || 'High resolution view'}
                className="max-h-[82vh] max-w-[92vw] object-contain select-none transition-all duration-200"
                draggable={false}
              />
            </div>

            {/* Desktop Navigation: Sleek right arrow button */}
            <button
              type="button"
              onClick={handleNext}
              className="hidden sm:flex absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-stone-100/70 hover:bg-stone-200/90 text-stone-700 hover:text-stone-950 items-center justify-center transition-all duration-200"
              aria-label="Next photo"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Bottom Bar: Photo counter info */}
          <div className="h-10 px-6 flex items-center justify-center text-stone-400 text-xs font-light tracking-widest uppercase">
            {lightboxIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );
}