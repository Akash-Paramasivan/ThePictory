import { apiFetch } from './client';

export interface MediaItem {
  id: number;
  categoryId: number;
  categoryName: string | null;
  title: string;
  description: string | null;
  cloudinaryUrl: string;
  sortOrder: number;
  isFeatured: boolean;
  createdAt: string;
}

export function getMedia(params?: { categoryId?: number; featuredOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.categoryId) query.set('categoryId', String(params.categoryId));
  if (params?.featuredOnly) query.set('featuredOnly', 'true');
  const qs = query.toString();
  return apiFetch<MediaItem[]>(`/api/media${qs ? `?${qs}` : ''}`);
}

export function uploadMedia(form: FormData) {
  return apiFetch<MediaItem>('/api/media/upload', {
    method: 'POST',
    auth: true,
    body: form,
  });
}

export function updateMedia(
  id: number,
  data: { categoryId: number; title: string; description?: string; sortOrder: number; isFeatured: boolean },
) {
  return apiFetch<void>(`/api/media/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify(data),
  });
}

export function deleteMedia(id: number) {
  return apiFetch<void>(`/api/media/${id}`, { method: 'DELETE', auth: true });
}
