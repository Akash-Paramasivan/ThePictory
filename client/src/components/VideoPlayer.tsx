import { useEffect, useRef, useState, type ReactNode } from 'react';
import { getYouTubeEmbedUrl } from '../lib/youtube';

/**
 * Custom video player wrapper.
 * - Hides YouTube's top title header + bottom watermark via overflow:hidden
 * - Uses YouTube Iframe Player API for play/pause via custom UI buttons
 */
export default function VideoPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(url);
  const src = embedUrl
    ? `${embedUrl}?controls=0&rel=0&playsinline=1&enablejsapi=1`
    : null;

  // Load YouTube Iframe API once
  useEffect(() => {
    if (!src) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // @ts-ignore - YouTube global
    window.onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: embedUrl?.split('/').pop(),
        playerVars: { controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: { data: number }) => {
            // YT.PlayerState.PLAYING === 1
            setPlaying(e.data === 1);
          },
        },
      });
    };
  }, [src, embedUrl]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (playing) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  return (
    <div className="relative overflow-hidden">
      {/* iframe placeholder — replaced by YT.Player */}
      <div ref={containerRef} className="aspect-video w-full" />

      {ready && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-charcoal/60 text-white hover:bg-charcoal transition-colors"
        >
          {playing ? '❚❚' : '▶'}
        </button>
      )}
    </div>
  );
}
