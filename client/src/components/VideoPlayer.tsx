import { useEffect, useRef, useState } from 'react';
import { getYouTubeEmbedUrl } from '../lib/youtube';

export default function VideoPlayer({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const embedUrl = getYouTubeEmbedUrl(url);
  const src = embedUrl
    ? `${embedUrl}?controls=0&rel=0&playsinline=1&enablejsapi=1`
    : null;

  useEffect(() => {
    if (!src) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (!containerRef.current) return;
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: embedUrl?.split('/').pop(),
        playerVars: { controls: 0, rel: 0, playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e: any) => setPlaying(e.data === 1),
        },
      });
    };
  }, [src, embedUrl]);

  const togglePlay = () => {
    if (!playerRef.current) return;
    playing ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      {src && (
        <iframe
          src={src}
          title="Video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            top: '-65px',
            left: '0',
            width: '100%',
            height: 'calc(100% + 130px)',
            pointerEvents: 'none',
          }}
        />
      )}

      {ready && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            pointerEvents: 'auto',
          }}
          className="p-4 rounded-full bg-charcoal/60 text-white hover:bg-charcoal transition-colors"
        >
          {playing ? '❚❚' : '▶'}
        </button>
      )}
    </div>
  );
}
