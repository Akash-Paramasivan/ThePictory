import { apiFetch } from './client';

export interface SiteSetting {
  offersPageEnabled: boolean;
  homepageVideoUrl: string | null;
  instagramUrl: string | null;
  youtubeProfileUrl: string | null;
}

export function getSiteSettings() {
  return apiFetch<SiteSetting>('/api/settings');
}

export function updateSiteSettings(
  offersPageEnabled: boolean,
  homepageVideoUrl: string | null,
  instagramUrl: string | null,
  youtubeProfileUrl: string | null,
) {
  return apiFetch<SiteSetting>('/api/settings', {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ offersPageEnabled, homepageVideoUrl, instagramUrl, youtubeProfileUrl }),
  });
}
