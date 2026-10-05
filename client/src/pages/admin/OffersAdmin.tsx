import { useEffect, useState, type FormEvent } from 'react';
import { deleteOffer, getAllOffers, updateOffer, createOffer, type Offer, type OfferMediaType } from '../../api/offers';
import { ApiError } from '../../api/client';
import OfferCard from '../../components/OfferCard';

export default function OffersAdmin() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaType, setMediaType] = useState<OfferMediaType>('Image');
  const [youTubeUrl, setYouTubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => getAllOffers().then(setOffers).catch(() => setOffers([]));

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('title', title);
      if (description) form.append('description', description);
      form.append('mediaType', mediaType);
      form.append('isActive', 'true');
      if (mediaType === 'YouTube') {
        form.append('youTubeUrl', youTubeUrl);
      } else if (file) {
        form.append('file', file);
      }
      await createOffer(form);
      setTitle('');
      setDescription('');
      setYouTubeUrl('');
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (offer: Offer) => {
    await updateOffer(offer.id, {
      title: offer.title,
      description: offer.description ?? undefined,
      isActive: !offer.isActive,
      startDate: offer.startDate ?? undefined,
      endDate: offer.endDate ?? undefined,
    });
    await load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this offer?')) return;
    await deleteOffer(id);
    await load();
  };

  return (
    <div className="bg-stone-50 min-h-screen p-8">
      <h1 className="font-serif text-3xl text-stone-900 mb-8">Offers</h1>

      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2 mb-8 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Media type</label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as OfferMediaType)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="Image">Image</option>
            <option value="YouTube">YouTube link</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        {mediaType === 'YouTube' ? (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">YouTube URL</label>
            <input
              required
              value={youTubeUrl}
              onChange={(e) => setYouTubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Image (JPEG/PNG/WEBP, max 10MB)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>
        )}
        {error && <p className="text-red-600 text-sm sm:col-span-2">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 rounded-md bg-neutral-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 w-fit"
        >
          {submitting ? 'Saving...' : 'Create offer'}
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div key={offer.id}>
            <OfferCard offer={offer} />
            <div className="flex justify-between mt-2 text-sm">
              <button type="button" onClick={() => toggleActive(offer)} className="text-neutral-600 hover:underline">
                {offer.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button type="button" onClick={() => handleDelete(offer.id)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {offers.length === 0 && <p className="text-neutral-500 text-sm">No offers yet.</p>}
    </div>
  );
}
