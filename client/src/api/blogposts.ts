import { apiFetch } from './client';

export interface BlogPost {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export function getActiveBlogPosts() {
  return apiFetch<BlogPost[]>('/api/blogposts');
}

export function createBlogPost(form: FormData) {
  return apiFetch<BlogPost>('/api/blogposts', { method: 'POST', auth: true, body: form });
}

export function deleteBlogPost(id: number) {
  return apiFetch<void>(`/api/blogposts/${id}`, { method: 'DELETE', auth: true });
}
