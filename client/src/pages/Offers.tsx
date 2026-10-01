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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <h1 className="font-serif text-4xl sm:text-5xl text-center text-charcoal mb-10">Offers</h1>
      {loading ? (
        <p className="text-center text-charcoal-soft">Loading...</p>
      ) : offers.length === 0 ? (
        <p className="text-center text-charcoal-soft">No current offers, check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
