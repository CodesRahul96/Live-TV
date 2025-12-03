import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from 'lucide-react';

export const CustomPlayer = ({ src, poster, title }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {
            // Auto-play might be blocked
            setIsPlaying(false);
        });
      });
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
            switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error("fatal network error encountered, try to recover");
                    hls.startLoad();
                    break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error("fatal media error encountered, try to recover");
                    hls.recoverMediaError();
                    break;
                default:
                    hls.destroy();
                    break;
            }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play();
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [src]);

  // Handle Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  // Controls Visibility
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Toggle Play/Pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Toggle Fullscreen
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    
    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
        // Lock Orientation
        if (screen.orientation && screen.orientation.lock) {
            await screen.orientation.lock('landscape').catch(e => console.log('Orientation lock failed:', e));
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
      // Unlock Orientation
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    }
  };

  return (
    <div 
        ref={containerRef}
        className="relative w-full h-full bg-black group overflow-hidden"
        onMouseMove={handleMouseMove}
        onClick={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-between p-4 z-10 ${showControls ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Top Bar */}
        <div className="flex justify-between items-start">
            <h2 className="text-white font-bold text-lg drop-shadow-md">{title}</h2>
        </div>

        {/* Center Play Button (only when paused) */}
        {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button 
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all pointer-events-auto"
                >
                    <Play className="w-12 h-12 text-white fill-current" />
                </button>
            </div>
        )}

        {/* Bottom Bar */}
        <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-primary-400 transition-colors">
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>

            <button onClick={toggleMute} className="text-white hover:text-primary-400 transition-colors">
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            <div className="flex-1"></div>

            <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
        </div>
      </div>
    </div>
  );
};
