import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getActiveOffers, type Offer } from '../api/offers';
import OfferCard from '../components/OfferCard';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const { offersPageEnabled, loaded } = useSiteSettings();

  useEffect(() => {
    getActiveOffers()
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loaded && !offersPageEnabled) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 px-6 text-center bg-stone-50">
        <h1 className="font-serif text-5xl sm:text-7xl text-stone-900 tracking-tight mb-4">Offers</h1>
        <p className="text-stone-500 font-light tracking-wider">LIMITED TIME ONLY — INQUIRE TODAY.</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        {loading ? (
          <p className="text-center text-stone-400 font-light">Loading...</p>
        ) : offers.length === 0 ? (
          <p className="text-center text-stone-400 font-light">No current offers, check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
