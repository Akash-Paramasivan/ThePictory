import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMedia, type MediaItem } from '../api/media';
import { getActiveOffers, type Offer } from '../api/offers';
import OfferCard from '../components/OfferCard';
import OfferBanner from '../components/OfferBanner';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getYouTubeBackgroundEmbedUrl } from '../lib/youtube';

export default function Home() {
  const [featured, setFeatured] = useState<MediaItem[]>([]);
  const [heroImages, setHeroImages] = useState<MediaItem[]>([]);
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [testimonials, setTestimonials] = useState<MediaItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const { offersPageEnabled, homepageVideoUrl } = useSiteSettings();

  useEffect(() => {
    getMedia({ featuredOnly: true }).then(setFeatured).catch(() => setFeatured([]));
    getMedia()
      .then((all) => {
        setHeroImages(all.filter((m) => m.isHero));
        setSlides(all.filter((m) => m.isSlide).sort((a, b) => (a.slideOrder || 0) - (b.slideOrder || 0)));
        setTestimonials(all.filter((m) => m.isTestimonial));
      })
      .catch(() => {
        setHeroImages([]);
        setSlides([]);
        setTestimonials([]);
      });
    if (offersPageEnabled) {
      getActiveOffers().then(setOffers).catch(() => setOffers([]));
    }
  }, [offersPageEnabled]);

  const heroImage = heroImages[0]?.cloudinaryUrl ?? featured[0]?.cloudinaryUrl;
  const videoEmbedUrl = homepageVideoUrl ? getYouTubeBackgroundEmbedUrl(homepageVideoUrl) : null;
  const [slideIndex, setSlideIndex] = useState(0);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const slideLengthRef = useRef(slides.length);
  useEffect(() => {
    if (slides.length !== slideLengthRef.current) {
      slideLengthRef.current = slides.length;
      setSlideIndex(0);
    }
  }, [slides.length]);

  useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setSlideIndex((i) => (i + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  useEffect(() => {
    const activeThumb = thumbStripRef.current?.children[slideIndex] as HTMLElement | undefined;
    activeThumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [slideIndex]);

  const goTo = (index: number) => setSlideIndex((index + slides.length) % slides.length);

  return (
    <div className="bg-white">
      {/* Hero — full-bleed image with minimalist overlay */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-stone-200" />
        )}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 mx-auto max-w-4xl w-full px-4 text-center">
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1.1] text-white tracking-wide">
            Capturing Love In Every Frame
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/90 font-light tracking-wider">
            RAW, REAL, AND DEEPLY ROOTED.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 border border-white text-white px-8 py-3 text-sm tracking-[0.2em] hover:bg-white hover:text-black transition-all"
            >
              EXPLORE PORTFOLIO
            </Link>
          </div>
        </div>
      </section>

      {/* Brand statement - Minimalist contrast */}
      <section className="py-24 px-6 bg-stone-50 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl sm:text-5xl text-stone-900 mb-8">Relive Every Emotion</h2>
          <p className="text-stone-600 leading-loose mb-6 font-light">
            Every celebration has its own rhythm, its own people, and its own story. Our role is simply to preserve
            it as it unfolds — the fleeting moments, genuine emotions, and little details you'll treasure most.
          </p>
          <p className="text-stone-600 leading-loose font-light">
            We create photographs that feel honest, timeless, and true to you, so years from now, you won't just
            remember the day. You'll remember how it felt.
          </p>
        </div>
      </section>

      {/* Offer Banner Demo (if active) */}
      <OfferBanner />

      {/* Portfolio gallery — slide-flagged photos, slideshow with thumbnail scroller */}
      {slides.length > 0 && (
        <section className="py-20">
          <h2 className="font-serif text-4xl text-center text-charcoal mb-10">Portfolio</h2>
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg shadow-lg bg-charcoal">
              {slides.map((item, index) => (
                <img
                  key={item.id}
                  src={item.cloudinaryUrl}
                  alt={item.title}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    index === slideIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <button
                type="button"
                onClick={() => goTo(slideIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal/60 text-white hover:bg-charcoal transition-colors"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => goTo(slideIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-charcoal/60 text-white hover:bg-charcoal transition-colors"
                aria-label="Next image"
              >
                ›
              </button>
            </div>
            <div
              ref={thumbStripRef}
              className="flex gap-3 overflow-x-auto pb-4 pt-4 snap-x snap-mandatory"
            >
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSlideIndex(index)}
                  aria-label={`Show ${item.title}`}
                  className={`snap-start flex-shrink-0 w-32 sm:w-40 aspect-[4/3] overflow-hidden rounded-md transition-opacity duration-300 ${
                    index === slideIndex ? 'opacity-100 ring-2 ring-charcoal' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={item.cloudinaryUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Showcase video */}
      {videoEmbedUrl && (
        <section className="relative w-full aspect-video max-h-[85vh] overflow-hidden bg-charcoal">
          <iframe
            src={videoEmbedUrl}
            title="The Pictory showcase video"
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            style={{ border: 'none' }}
          />
        </section>
      )}

      {/* Kind Words — testimonial-flagged photos with quotes */}
      {testimonials.length > 0 && (
        <section className="bg-cream py-20 px-4 sm:px-6">
          <h2 className="font-serif text-4xl text-center text-charcoal mb-12">Kind Words</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {testimonials.map((item) => (
              <figure key={item.id} className="text-center">
                <img
                  src={item.cloudinaryUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover mb-4"
                />
                <blockquote className="text-sm text-charcoal-soft leading-relaxed mb-3">
                  {item.description ?? item.title}
                </blockquote>
                <figcaption className="text-xs uppercase tracking-[0.15em] text-charcoal">{item.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Offers */}
      {offersPageEnabled && offers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
          <h2 className="font-serif text-4xl text-center text-charcoal mb-10">Current Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* CTA band */}
      <section className="bg-blush py-20 px-4 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-charcoal mb-3">Let's Begin Your Journey</h2>
        <p className="text-charcoal-soft mb-8">Every story is unique. We'd be honoured to tell yours.</p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-4 text-xs uppercase tracking-[0.15em] hover:bg-charcoal/90 transition-colors"
        >
          Inquire Now <span aria-hidden>✳</span>
        </Link>
      </section>
    </div>
  );
}
