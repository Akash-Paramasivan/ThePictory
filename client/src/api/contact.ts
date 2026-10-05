import { apiFetch } from './client';

export interface ContactSubmission {
  id: number;
  eventType: string;
  photographyDays: string;
  budget: string;
  fullName: string;
  whatsAppCountryCode: string;
  whatsAppNumber: string;
  submittedAt: string;
  isRead: boolean;
}

export function submitContactForm(data: {
  eventType: string;
  photographyDays: string;
  budget: string;
  fullName: string;
  whatsAppCountryCode: string;
  whatsAppNumber: string;
}) {
  return apiFetch<{ message: string }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function getContactSubmissions() {
  return apiFetch<ContactSubmission[]>('/api/contact', { auth: true });
}

export function markContactRead(id: number) {
  return apiFetch<void>(`/api/contact/${id}/read`, { method: 'PUT', auth: true });
}
