import { apiFetch } from './client';

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

export function submitContactForm(data: { name: string; email: string; phone?: string; message: string }) {
  return apiFetch<{ message: string }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getContactSubmissions() {
  return apiFetch<ContactSubmission[]>('/api/contact', { auth: true });
}

export function markContactRead(id: number) {
  return apiFetch<void>(`/api/contact/${id}/read`, { method: 'PATCH', auth: true });
}
