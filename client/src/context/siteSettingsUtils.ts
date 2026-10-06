import { getSiteSettings } from '../api/settings';

export async function loadSiteSettings() {
  try {
    const s = await getSiteSettings();
    return {
      offersPageEnabled: s.offersPageEnabled,
      homepageVideoUrl: s.homepageVideoUrl,
      instagramUrl: s.instagramUrl,
      youtubeProfileUrl: s.youtubeProfileUrl,
    };
  } catch {
    return null;
  }
}