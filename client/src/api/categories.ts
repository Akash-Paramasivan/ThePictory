import { apiFetch } from './client';

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

export function getCategories() {
  return apiFetch<Category[]>('/api/categories');
}

export function createCategory(name: string, sortOrder: number) {
  return apiFetch<Category>('/api/categories', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ name, sortOrder }),
  });
}

export function updateCategory(id: number, name: string, sortOrder: number) {
  return apiFetch<void>(`/api/categories/${id}`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ name, sortOrder }),
  });
}

export function deleteCategory(id: number) {
  return apiFetch<void>(`/api/categories/${id}`, { method: 'DELETE', auth: true });
}
