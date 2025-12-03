import React, { useEffect, useRef } from 'react';
import Plyr from 'plyr';
import Hls from 'hls.js';
import 'plyr/dist/plyr.css';

export const PlyrPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize HLS
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }

    // Initialize Plyr
    const player = new Plyr(video, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      hideControls: true,
    });
    playerRef.current = player;

    // Handle Mobile Landscape on Fullscreen
    const handleEnterFullscreen = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
        }
      } catch (err) {
        console.log('Orientation lock failed:', err);
      }
    };

    const handleExitFullscreen = () => {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (err) {
        console.log('Orientation unlock failed:', err);
      }
    };

    player.on('enterfullscreen', handleEnterFullscreen);
    player.on('exitfullscreen', handleExitFullscreen);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [src]);

  return (
    <div className="w-full h-full">
      <video
        ref={videoRef}
        className="plyr-react plyr"
        poster={poster}
        crossOrigin="anonymous"
        playsInline
      />
    </div>
  );
};
