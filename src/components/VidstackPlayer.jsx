import React, { useEffect, useRef } from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react';

export const VidstackPlayer = ({ src, poster, title }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    // Handle Mobile Landscape on Fullscreen
    const handleFullscreenChange = async (detail) => {
      const isFullscreen = detail.active;
      try {
        if (isFullscreen) {
          if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape');
          }
        } else {
          if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
          }
        }
      } catch (err) {
        console.log('Orientation lock/unlock failed:', err);
      }
    };

    // Subscribe to fullscreen change event
    const unsubscribe = player.subscribe(({ fullscreen }) => {
        handleFullscreenChange({ active: fullscreen });
    });

    return () => {
        unsubscribe();
    };
  }, []);

  return (
    <MediaPlayer 
        ref={playerRef}
        title={title} 
        src={src} 
        poster={poster}
        className="w-full h-full aspect-video bg-black text-white overflow-hidden rounded-md ring-media-focus data-focus:ring-4"
        playsInline
        crossOrigin
    >
      <MediaProvider />
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
};
