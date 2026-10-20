/** Extracts the video id from common YouTube URL formats for safe iframe embedding. */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?[^#\s]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,20})/i);
  if (!match) return null;
  return match[1];
}

/** Extracts the post/reel id from Instagram URLs (handles query strings). */
export function extractInstagramId(url: string): string | null {
  const cleanUrl = url.split('?')[0]; // Strip query for ID extraction
  const match = cleanUrl.match(/instagram\.com\/(?:reel\/|p\/)([\w-]{6,20})/i);
  if (!match) return null;
  return match[1];
}

/** Extracts the video id and returns a plain embed URL for an inline player. */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?controls=0&rel=0&modestbranding=1&playsinline=1`;
}

/** Autoplaying, muted, looping, chromeless embed suitable for a background/showcase video section. */
export function getYouTubeBackgroundEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0&playsinline=1&origin=${window.location.origin}`;
}

export type EmbedType = 'youtube' | 'instagram' | null;

export interface EmbedConfig {
  url: string;
  type: EmbedType;
  aspectRatio: '16/9' | '9/16' | 'auto';
}

/**
 * Detects the platform and returns the correct embed configuration for the homepage showcase.
 */
export function getShowcaseEmbedConfig(url: string): EmbedConfig | null {
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      url: getYouTubeBackgroundEmbedUrl(url)!,
      type: 'youtube',
      aspectRatio: '16/9',
    };
  }

  const igId = extractInstagramId(url);
  if (igId) {
    // Determine if it's a reel or a post for the embed URL
    const isReel = url.includes('/reel/');
    const path = isReel ? 'reel' : 'p';
    return {
      url: `https://www.instagram.com/${path}/${igId}/embed`,
      type: 'instagram',
      aspectRatio: isReel ? '9/16' : 'auto',
    };
  }

  return null;
}
