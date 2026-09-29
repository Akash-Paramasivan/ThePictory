/** Extracts the video id from common YouTube URL formats for safe iframe embedding. */
export function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,20})/i);
  if (!match) return null;
  return `https://www.youtube.com/embed/${match[1]}`;
}
