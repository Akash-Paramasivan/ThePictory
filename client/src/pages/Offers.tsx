import { useEffect, useState } from 'react';
import { getActiveOffers, type Offer } from '../api/offers';
import OfferCard from '../components/OfferCard';

export default function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveOffers()
      .then(setOffers)
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-semibold mb-6">Offers</h1>
      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : offers.length === 0 ? (
        <p className="text-neutral-500">No current offers, check back soon!</p>
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
