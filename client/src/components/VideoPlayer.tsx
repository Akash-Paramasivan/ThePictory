import { useEffect, useRef, useState } from 'react';
import { getYouTubeEmbedUrl } from '../lib/youtube';

const EMBED_PARAMS = 'controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1';

export default function VideoPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(url);
  const videoId = embedUrl?.split('/').pop() ?? null;

  // Load the YouTube Iframe API once and mount the player into the placeholder div.
  // YT.Player injects its own <iframe> carrying EMBED_PARAMS.
  useEffect(() => {
    if (!videoId) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: any) => setPlaying(e.data === 1),
        },
      });
    };
  }, [videoId]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  return (
    <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {ready && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-4 rounded-full bg-charcoal/60 text-white hover:bg-charcoal transition-colors"
        >
          {playing ? '❚❚' : '▶'}
        </button>
      )}
    </div>
  );
}
