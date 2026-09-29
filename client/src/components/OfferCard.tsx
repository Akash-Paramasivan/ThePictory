import { getYouTubeEmbedUrl } from '../lib/youtube';
import type { Offer } from '../api/offers';

export default function OfferCard({ offer }: { offer: Offer }) {
  const embedUrl = offer.mediaType === 'YouTube' && offer.youTubeUrl ? getYouTubeEmbedUrl(offer.youTubeUrl) : null;

  return (
    <article className="rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
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
      <div className="p-4">
        <h3 className="font-semibold text-lg">{offer.title}</h3>
        {offer.description && <p className="text-neutral-600 text-sm mt-1">{offer.description}</p>}
      </div>
    </article>
  );
}
