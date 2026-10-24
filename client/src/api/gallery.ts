import { apiFetch } from './client';

export interface GalleryItem {
  id: number;
  imageUrl: string;
  cloudinaryPublicId: string;
  title: string;
  displayOrder: number;
  isHeroCover: boolean;
  createdAt: string;
}

export interface TestimonialVideo {
  id: number;
  youTubeUrl: string;
  coupleName: string;
  weddingDate: string | null;
}

export interface GalleryResponse {
  heroImage: GalleryItem | null;
  photos: GalleryItem[];
  testimonials: TestimonialVideo[];
}

export function getGalleryData() {
  return apiFetch<GalleryResponse>('/api/gallery');
}

export function uploadGalleryImages(form: FormData) {
  return apiFetch<GalleryItem[]>('/api/gallery/bulk-upload', {
    method: 'POST',
    auth: true,
    body: form,
  });
}

export function setGalleryCover(id: number) {
  return apiFetch<void>(`/api/gallery/set-cover/${id}`, {
    method: 'PUT',
    auth: true,
  });
}

export function deleteGalleryItem(id: number) {
  return apiFetch<void>(`/api/gallery/${id}`, { method: 'DELETE', auth: true });
}

export function getTestimonials() {
  return apiFetch<TestimonialVideo[]>('/api/testimonials');
}

export function addTestimonial(data: { youTubeUrl: string; coupleName?: string; weddingDate?: string }) {
  return apiFetch<TestimonialVideo>('/api/testimonials', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(data),
  });
}

export function deleteTestimonial(id: number) {
  return apiFetch<void>(`/api/testimonials/${id}`, { method: 'DELETE', auth: true });
}