import { getYouTubeEmbedUrl } from '../lib/embeds';
import type { Offer } from '../api/offers';
import SmartImage from './SmartImage';
import VideoPlayer from './VideoPlayer';

export default function OfferCard({ offer }: { offer: Offer }) {
  const embedUrl = offer.mediaType === 'YouTube' && offer.youTubeUrl ? getYouTubeEmbedUrl(offer.youTubeUrl) : null;

  return (
    <article className="border border-stone-200 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      {offer.mediaType === 'Image' && offer.imageUrl ? (
        <SmartImage src={offer.imageUrl} alt={offer.title} className="w-full h-72 object-cover" />
      ) : (
        <div className="w-full h-72 bg-stone-100 flex items-center justify-center text-stone-400">No image</div>
      )}
      {embedUrl && (
        <div className="aspect-video w-full">
          <VideoPlayer url={offer.youTubeUrl!} />
        </div>
      )}
      <div className="p-6 text-center">
        <h3 className="font-serif text-2xl text-stone-800 mb-2">{offer.title}</h3>
        {offer.description && <p className="text-stone-500 text-sm leading-relaxed">{offer.description}</p>}
      </div>
    </article>
  );
}
