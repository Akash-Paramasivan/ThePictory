import { apiFetch } from './client';

export function login(username: string, password: string) {
  return apiFetch<{ ticket: string; message: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function verifyOtp(ticket: string, code: string) {
  return apiFetch<{ token: string; expiresAt: string }>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ ticket, code }),
  });
}
