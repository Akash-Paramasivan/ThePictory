import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMedia, type MediaItem } from '../api/media';
import { getActiveOffers, type Offer } from '../api/offers';
import OfferCard from '../components/OfferCard';

export default function Home() {
  const [featured, setFeatured] = useState<MediaItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    getMedia({ featuredOnly: true }).then(setFeatured).catch(() => setFeatured([]));
    getActiveOffers().then(setOffers).catch(() => setOffers([]));
  }, []);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900">
          Capturing moments that last forever
        </h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          Professional photography for weddings, portraits, and events.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/portfolio" className="rounded-full bg-neutral-900 text-white px-6 py-3 text-sm font-medium">
            View Portfolio
          </Link>
          <Link to="/contact" className="rounded-full border border-neutral-300 px-6 py-3 text-sm font-medium">
            Get in touch
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-semibold mb-6">Latest Work</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((item) => (
              <img
                key={item.id}
                src={item.cloudinaryUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-40 sm:h-52 object-cover rounded-lg"
              />
            ))}
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h2 className="text-2xl font-semibold mb-6">Current Offers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
