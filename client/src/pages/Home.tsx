import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMedia, type MediaItem } from '../api/media';
import { getActiveOffers, type Offer } from '../api/offers';
import OfferCard from '../components/OfferCard';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { getYouTubeBackgroundEmbedUrl } from '../lib/youtube';

export default function Home() {
  const [featured, setFeatured] = useState<MediaItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const { offersPageEnabled, homepageVideoUrl } = useSiteSettings();

  useEffect(() => {
    getMedia({ featuredOnly: true }).then(setFeatured).catch(() => setFeatured([]));
    if (offersPageEnabled) {
      getActiveOffers().then(setOffers).catch(() => setOffers([]));
    }
  }, [offersPageEnabled]);

  const heroImage = featured[0]?.cloudinaryUrl;
  const secondaryImage = featured[1]?.cloudinaryUrl ?? heroImage;
  const videoEmbedUrl = homepageVideoUrl ? getYouTubeBackgroundEmbedUrl(homepageVideoUrl) : null;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[80vh] min-h-[480px] flex items-end">
        {heroImage ? (
          <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-blush" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-6xl w-full px-4 sm:px-6 pb-16">
          <h1 className="font-serif text-5xl sm:text-7xl leading-[1.05] text-white max-w-2xl">
            Capturing Love In Every Frame
          </h1>
          <p className="mt-5 text-base sm:text-lg text-white/90 max-w-xl">
            Timeless photography & films for weddings, portraits, and every story worth telling.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-2 border border-white text-white px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-white hover:text-charcoal transition-colors"
            >
              Explore Portfolio <span aria-hidden>✳</span>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-charcoal px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-cream transition-colors"
            >
              Inquire Now <span aria-hidden>✳</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand statement */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh]">
        <div className="flex flex-col justify-center px-6 sm:px-16 py-16 bg-cream">
          <h2 className="font-serif text-4xl sm:text-5xl text-charcoal mb-6">Relive Every Emotion</h2>
          <p className="text-charcoal-soft leading-relaxed mb-4">
            Every celebration has its own rhythm, its own people, and its own story. Our role is simply to preserve
            it as it unfolds &mdash; the fleeting moments, genuine emotions, and little details you'll treasure most.
          </p>
          <p className="text-charcoal-soft leading-relaxed mb-8">
            We create photographs that feel honest, timeless, and true to you, so years from now, you won't just
            remember the day. You'll remember how it felt.
          </p>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 border border-charcoal text-charcoal px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-charcoal hover:text-white transition-colors w-fit"
          >
            Explore Portfolio <span aria-hidden>✳</span>
          </Link>
        </div>
        <div className="min-h-[320px] bg-blush">
          {secondaryImage && <img src={secondaryImage} alt="" className="w-full h-full object-cover" />}
        </div>
      </section>

      {/* Showcase video */}
      {videoEmbedUrl && (
        <section className="relative w-full aspect-video max-h-[85vh] overflow-hidden bg-charcoal">
          <iframe
            src={videoEmbedUrl}
            title="The Pictory showcase video"
            className="absolute inset-0 w-full h-full pointer-events-none scale-[1.4] sm:scale-100"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </section>
      )}

      {/* Latest work filmstrip */}
      {featured.length > 0 && (
        <section className="py-20">
          <h2 className="font-serif text-4xl text-center text-charcoal mb-10">Latest Work</h2>
          <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory">
            {featured.map((item) => (
              <img
                key={item.id}
                src={item.cloudinaryUrl}
                alt={item.title}
                loading="lazy"
                className="h-72 sm:h-96 w-auto flex-shrink-0 object-cover snap-start"
              />
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
