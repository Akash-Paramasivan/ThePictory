import { apiFetch } from './client';

export interface Movie {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  isActive: boolean;
}

export function getActiveMovies() {
  return apiFetch<Movie[]>('/api/movies');
}

export function createMovie(form: FormData) {
  return apiFetch<Movie>('/api/movies', { method: 'POST', auth: true, body: form });
}

export function deleteMovie(id: number) {
  return apiFetch<void>(`/api/movies/${id}`, { method: 'DELETE', auth: true });
}
