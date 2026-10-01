import { apiFetch } from './client';

export interface SiteSetting {
  offersPageEnabled: boolean;
}

export function getSiteSettings() {
  return apiFetch<SiteSetting>('/api/settings');
}

export function updateSiteSettings(offersPageEnabled: boolean) {
  return apiFetch<SiteSetting>('/api/settings', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ offersPageEnabled }),
  });
}
