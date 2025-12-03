import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-eme';

export const VideoPlayer = ({ src, type, drm, poster }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (!playerRef.current) {
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        poster: poster,
        sources: [{
          src: src,
          type: type
        }],
        html5: {
          vhs: {
            overrideNative: true
          },
          nativeAudioTracks: false,
          nativeVideoTracks: false
        }
      });

      if (drm) {
        player.eme();
        player.src({
          src: src,
          type: type,
          keySystems: drm
        });
      }

    } else {
      const player = playerRef.current;

      player.poster(poster);
      
      if (drm) {
        player.src({
          src: src,
          type: type,
          keySystems: drm
        });
      } else {
        player.src({ src, type });
      }
    }
  }, [src, type, drm, poster]);

  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div data-vjs-player className="w-full h-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
      <div ref={videoRef} className="w-full h-full" />
      <style>{`
        .video-js {
          width: 100%;
          height: 100%;
          background-color: #0f172a;
        }
        .vjs-big-play-button {
          background-color: rgba(14, 165, 233, 0.8) !important;
          border: none !important;
          border-radius: 50% !important;
          width: 80px !important;
          height: 80px !important;
          line-height: 80px !important;
          margin-top: -40px !important;
          margin-left: -40px !important;
          transition: all 0.3s ease;
        }
        .vjs-big-play-button:hover {
          background-color: rgba(2, 132, 199, 0.9) !important;
          transform: scale(1.1);
        }
        .vjs-control-bar {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent) !important;
        }
      `}</style>
    </div>
  );
}

export default VideoPlayer;
