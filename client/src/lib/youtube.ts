/** Extracts the video id from common YouTube URL formats for safe iframe embedding. */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?[^#\s]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{6,20})/i);
  if (!match) return null;
  return match[1];
}

/** Extracts the video id and returns a plain embed URL for an inline player. */
export function getYouTubeEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}`;
}

/** Autoplaying, muted, looping, chromeless embed suitable for a background/showcase video section. */
export function getYouTubeBackgroundEmbedUrl(url: string): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&disablekb=1&fs=0&iv_load_policy=3&modestbranding=1&rel=0&showinfo=0`;
}
