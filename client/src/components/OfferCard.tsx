import { getYouTubeEmbedUrl } from '../lib/youtube';
import type { Offer } from '../api/offers';

export default function OfferCard({ offer }: { offer: Offer }) {
  const embedUrl = offer.mediaType === 'YouTube' && offer.youTubeUrl ? getYouTubeEmbedUrl(offer.youTubeUrl) : null;

  return (
    <article className="border border-stone-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {offer.mediaType === 'Image' && offer.imageUrl ? (
        <img src={offer.imageUrl} alt={offer.title} className="w-full h-72 object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-72 bg-stone-100 flex items-center justify-center text-stone-400">No image</div>
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
      <div className="p-6 text-center">
        <h3 className="font-serif text-2xl text-stone-800 mb-2">{offer.title}</h3>
        {offer.description && <p className="text-stone-500 text-sm leading-relaxed">{offer.description}</p>}
      </div>
    </article>
  );
}
