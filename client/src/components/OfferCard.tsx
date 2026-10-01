import { getYouTubeEmbedUrl } from '../lib/youtube';
import type { Offer } from '../api/offers';

export default function OfferCard({ offer }: { offer: Offer }) {
  const embedUrl = offer.mediaType === 'YouTube' && offer.youTubeUrl ? getYouTubeEmbedUrl(offer.youTubeUrl) : null;

  return (
    <article className="border border-charcoal/10 overflow-hidden bg-cream">
      {offer.mediaType === 'Image' && offer.imageUrl && (
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-56 object-cover" loading="lazy" />
      )}
      {embedUrl && (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={offer.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-serif text-xl text-charcoal">{offer.title}</h3>
        {offer.description && <p className="text-charcoal-soft text-sm mt-1">{offer.description}</p>}
      </div>
    </article>
  );
}
