import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getActiveOffers, type Offer } from '../api/offers';
import { useSiteSettings } from '../context/SiteSettingsContext';

const STORAGE_KEY = 'pictory.offerBannerShown';

/**
 * "Grab the exciting offer" banner shown once after the user submits the
 * contact form and returns from the WhatsApp hand-off (Contact sets the
 * `offer-banner` session flag before redirecting).
 */
export default function OfferBanner() {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [visible, setVisible] = useState(false);
  const { offersPageEnabled } = useSiteSettings();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!offersPageEnabled) return;
    // Only show when the user was just redirected back from WhatsApp.
    // For testing/demos: allow ?showBanner=1 to preview without WhatsApp redirect.
    const url = new URL(window.location.href);
    const forceShow = url.searchParams.get('showBanner') === '1';
    if (!forceShow) {
      if (sessionStorage.getItem('offer-banner') !== 'pending') return;
    }
    // Show only once per browser until an admin publishes a new offer.
    if (localStorage.getItem(STORAGE_KEY) === 'shown') return;

    getActiveOffers()
      .then((offers) => {
        const first = offers.find((o) => o.mediaType === 'Image' && o.imageUrl) ?? offers[0];
        if (first) {
          setOffer(first);
          setVisible(true);
          sessionStorage.removeItem('offer-banner');
          localStorage.setItem(STORAGE_KEY, 'shown');
        }
      })
      .catch(() => {
        sessionStorage.removeItem('offer-banner');
      });
  }, [offersPageEnabled]);

  // Only surface on the homepage — this is the landing page after the WhatsApp hand-off.
  if (pathname !== '/' || !visible || !offer) return null;

  return (
    <section className="relative w-full overflow-hidden bg-blush">
      {offer.mediaType === 'Image' && offer.imageUrl ? (
        <img src={offer.imageUrl} alt={offer.title} className="w-full max-h-[480px] object-cover" />
      ) : (
        <img
          src="/assets/offer-banner-placeholder.svg"
          alt="Exciting offer"
          className="w-full max-h-[480px] object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-3xl sm:text-5xl text-white drop-shadow">
          {offer.title || "Don't miss this exciting offer!"}
        </p>
        {offer.description && (
          <p className="mt-3 text-white/90 max-w-xl">{offer.description}</p>
        )}
        <Link
          to="/offers"
          className="mt-6 inline-flex items-center gap-2 bg-white text-charcoal px-6 py-3 text-xs uppercase tracking-[0.15em] hover:bg-cream transition-colors"
        >
          Grab the offer <span aria-hidden>✳</span>
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss offer banner"
        className="absolute top-4 right-4 p-2 rounded-full bg-charcoal/50 text-white hover:bg-charcoal transition-colors"
      >
        ✕
      </button>
    </section>
  );
}
