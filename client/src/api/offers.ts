import { apiFetch } from './client';

export type OfferMediaType = 'Image' | 'YouTube';

export interface Offer {
  id: number;
  title: string;
  description: string | null;
  mediaType: OfferMediaType;
  imageUrl: string | null;
  youTubeUrl: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
}

export function getActiveOffers() {
  return apiFetch<Offer[]>('/api/offers/active');
}

export function getAllOffers() {
  return apiFetch<Offer[]>('/api/offers', { auth: true });
}

export function createOffer(form: FormData) {
  return apiFetch<Offer>('/api/offers', { method: 'POST', auth: true, body: form });
}

export function updateOffer(
  id: number,
  data: { title: string; description?: string; isActive: boolean; startDate?: string; endDate?: string },
) {
  return apiFetch<void>(`/api/offers/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(data),
  });
}

export function deleteOffer(id: number) {
  return apiFetch<void>(`/api/offers/${id}`, { method: 'DELETE', auth: true });
}
