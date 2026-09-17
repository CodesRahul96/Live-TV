import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2, 
  RotateCcw, 
  PictureInPicture, 
  Tv, 
  Clock, 
  Settings, 
  SkipBack, 
  SkipForward, 
  Moon, 
  Radio, 
  Check, 
  AlertCircle,
  Expand,
  Shrink
} from 'lucide-react';

const STORAGE_KEY_VOLUME = 'live_tv_volume';
const STORAGE_KEY_MUTED = 'live_tv_muted';

export const CustomPlayer = ({
  src,
  poster,
  title,
  category,
  onPrevChannel,
  onNextChannel,
  hasPrevChannel = false,
  hasNextChannel = false,
  isTheaterMode = false,
  onToggleTheater,
  onError,
  onShowToast,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
    } catch {
      return false;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // HLS qualities
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null);
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const sleepTimerRef = useRef(null);
  const sleepIntervalRef = useRef(null);

  // Visual shortcut feedback
  const [feedback, setFeedback] = useState(null);

  const showShortcutFeedback = (icon, text) => {
    setFeedback({ icon, text });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
    }, 1200);
  };

  // Digital clock in player HUD
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sleep timer logic
  useEffect(() => {
    if (sleepTimerMinutes && sleepTimerMinutes > 0) {
      const endTime = Date.now() + sleepTimerMinutes * 60 * 1000;

      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);

      sleepTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
          onShowToast?.({ type: 'info', message: 'Sleep timer reached. Stream paused.' });
        }
        setSleepTimerMinutes(null);
        setSleepTimerRemaining(null);
      }, sleepTimerMinutes * 60 * 1000);

      sleepIntervalRef.current = setInterval(() => {
        const remainingMs = endTime - Date.now();
        if (remainingMs <= 0) {
          setSleepTimerRemaining(null);
          clearInterval(sleepIntervalRef.current);
        } else {
          const mins = Math.floor(remainingMs / 60000);
          const secs = Math.floor((remainingMs % 60000) / 1000);
          setSleepTimerRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        }
      }, 1000);
    } else {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
      setSleepTimerRemaining(null);
    }

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
      if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
    };
  }, [sleepTimerMinutes]);

  // Initialize HLS & stream
  const initPlayer = useCallback(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setIsLoading(true);
    setHasError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        setHasError(false);

        // Extract available resolutions
        if (data.levels && data.levels.length > 0) {
          const formattedQualities = data.levels.map((level, idx) => ({
            id: idx,
            label: level.height ? `${level.height}p` : `Level ${idx + 1}`,
            height: level.height,
            bitrate: level.bitrate,
          }));
          setQualities(formattedQualities);
        }

        video.volume = volume;
        video.muted = isMuted;

        video.play().catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('Network error in HLS, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('Media error in HLS, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal unrecoverable HLS error:', data);
              hls.destroy();
              setHasError(true);
              setIsLoading(false);
              onError?.(data);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.volume = volume;
      video.muted = isMuted;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setHasError(false);
        video.play().catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
        onError?.(new Error('HTML5 video error'));
      });
    }
  }, [src, volume, isMuted, onError]);

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initPlayer]);

  // Video state event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setHasError(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Controls Visibility Timeout
  const triggerControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showQualityMenu && !showSleepMenu) {
        setShowControls(false);
      }
    }, 3500);
  }, [isPlaying, showQualityMenu, showSleepMenu]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        showShortcutFeedback(Play, 'Playing');
      }).catch((e) => console.warn('Play error:', e));
    } else {
      video.pause();
      showShortcutFeedback(Pause, 'Paused');
    }
    triggerControls();
  }, [triggerControls]);

  // Volume handler
  const handleVolumeChange = useCallback((newVol) => {
    const val = Math.max(0, Math.min(1, parseFloat(newVol)));
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
    try {
      localStorage.setItem(STORAGE_KEY_VOLUME, val.toString());
      localStorage.setItem(STORAGE_KEY_MUTED, (val === 0).toString());
    } catch (e) {}
    showShortcutFeedback(val === 0 ? VolumeX : Volume2, `${Math.round(val * 100)}%`);
  }, [isMuted]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    try {
      localStorage.setItem(STORAGE_KEY_MUTED, nextMuted.toString());
    } catch (e) {}
    showShortcutFeedback(nextMuted ? VolumeX : Volume2, nextMuted ? 'Muted' : `${Math.round(volume * 100)}%`);
  }, [isMuted, volume]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen();
        setIsFullscreen(true);
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape').catch(() => {});
        }
        showShortcutFeedback(Maximize, 'Fullscreen');
      } catch (err) {
        console.error('Fullscreen error:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
        showShortcutFeedback(Minimize, 'Exit Fullscreen');
      } catch (err) {
        console.error('Exit fullscreen error:', err);
      }
    }
  }, []);

  // Listen for fullscreen change event from browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Picture-in-Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        showShortcutFeedback(PictureInPicture, 'PiP Disabled');
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        showShortcutFeedback(PictureInPicture, 'PiP Enabled');
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
      onShowToast?.({ type: 'error', message: 'Picture-in-Picture is not supported in this browser' });
    }
  }, [onShowToast]);

  // Quality switch
  const handleSelectQuality = (qualityId) => {
    setCurrentQuality(qualityId);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = qualityId;
    }
    setShowQualityMenu(false);
    const selectedObj = qualities.find((q) => q.id === qualityId);
    showShortcutFeedback(Settings, selectedObj ? selectedObj.label : 'Auto Quality');
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 't':
          e.preventDefault();
          onToggleTheater?.();
          break;
        case 'r':
          e.preventDefault();
          initPlayer();
          showShortcutFeedback(RotateCcw, 'Reloading Stream');
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.05));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.05));
          break;
        case '[':
          if (hasPrevChannel && onPrevChannel) {
            e.preventDefault();
            onPrevChannel();
            showShortcutFeedback(SkipBack, 'Previous Channel');
          }
          break;
        case ']':
          if (hasNextChannel && onNextChannel) {
            e.preventDefault();
            onNextChannel();
            showShortcutFeedback(SkipForward, 'Next Channel');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay, 
    toggleMute, 
    toggleFullscreen, 
    togglePiP, 
    onToggleTheater, 
    initPlayer, 
    handleVolumeChange, 
    volume, 
    hasPrevChannel, 
    hasNextChannel, 
    onPrevChannel, 
    onNextChannel
  ]);

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControls}
      onTouchStart={triggerControls}
      className="relative w-full h-full bg-black select-none overflow-hidden group flex items-center justify-center"
    >
      {/* HTML5 Video element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        crossOrigin="anonymous"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Visual Feedback Overlay on Shortcut / Interaction */}
      {feedback && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-fade-in">
          <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 text-white shadow-2xl">
            <feedback.icon size={36} className="text-sky-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs z-20 pointer-events-none">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin mb-3" />
          <p className="text-white/80 text-xs font-medium tracking-wide">Connecting to Live Stream...</p>
        </div>
      )}

      {/* Error Fallback Card */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md z-20 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 border border-rose-500/20">
            <AlertCircle size={28} />
          </div>
          <h3 className="text-white font-bold text-base sm:text-lg mb-1">Stream Temporarily Unavailable</h3>
          <p className="text-white/60 text-xs sm:text-sm max-w-md mb-4">
            This live stream source could not be reached. It may be geo-restricted, offline, or experiencing high load.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={initPlayer}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-sky-500/25"
            >
              <RotateCcw size={16} />
              Retry Stream
            </button>
            {hasNextChannel && (
              <button
                onClick={onNextChannel}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-2 transition-all"
              >
                <SkipForward size={16} />
                Next Channel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <button
            onClick={togglePlay}
            className="p-5 rounded-full bg-sky-500/90 text-white shadow-2xl shadow-sky-500/40 hover:bg-sky-500 hover:scale-110 active:scale-95 transition-all pointer-events-auto"
            aria-label="Play channel"
          >
            <Play className="w-10 h-10 fill-current ml-1" />
          </button>
        </div>
      )}

      {/* Modern Player HUD Controls */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/70 flex flex-col justify-between p-3 sm:p-5 transition-opacity duration-300 z-10 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Live pulsating badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-bold tracking-wider uppercase shadow-md shadow-rose-500/30 shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
            {/* Channel Title & Category */}
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm sm:text-base truncate drop-shadow-md">
                {title || 'Live Stream'}
              </h2>
              {category && (
                <span className="text-[11px] text-white/70 font-medium">{category}</span>
              )}
            </div>
          </div>

          {/* Right Top Status (Clock & Reload) */}
          <div className="flex items-center gap-2 shrink-0">
            {sleepTimerRemaining && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/80 text-white text-xs font-semibold backdrop-blur-sm shadow-xs">
                <Moon size={13} />
                <span>{sleepTimerRemaining}</span>
              </div>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white/90 text-xs font-mono backdrop-blur-sm">
              <Clock size={13} className="text-sky-400" />
              <span>{currentTimeStr}</span>
            </div>
            <button
              onClick={initPlayer}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-all backdrop-blur-sm"
              title="Reload current stream (R)"
              aria-label="Reload current stream"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Controls Bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Controls: Prev, Play/Pause, Next, Volume */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Prev Channel */}
              <button
                disabled={!hasPrevChannel}
                onClick={onPrevChannel}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Previous channel ([)"
                aria-label="Previous channel"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white hover:scale-105 active:scale-95 transition-all shadow-xs"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>

              {/* Next Channel */}
              <button
                disabled={!hasNextChannel}
                onClick={onNextChannel}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Next channel (])"
                aria-label="Next channel"
              >
                <SkipForward size={18} />
              </button>

              {/* Volume Slider Group */}
              <div className="flex items-center gap-1.5 ml-1 sm:ml-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={18} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="w-16 sm:w-24 h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sky-400 hover:accent-sky-300 transition-all"
                  aria-label="Volume slider"
                />
              </div>
            </div>

            {/* Right Controls: Quality, Sleep Timer, PiP, Theater, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Quality Selector */}
              {qualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSleepMenu(false);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 text-xs font-medium flex items-center gap-1.5 transition-all"
                    title="Stream Quality"
                  >
                    <Settings size={14} />
                    <span className="hidden sm:inline">
                      {currentQuality === -1
                        ? 'Auto'
                        : qualities.find((q) => q.id === currentQuality)?.label || 'Quality'}
                    </span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-32 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl text-white text-xs z-50 animate-fade-in">
                      <div className="px-3 py-1 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                        Resolution
                      </div>
                      <button
                        onClick={() => handleSelectQuality(-1)}
                        className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors ${
                          currentQuality === -1 ? 'text-sky-400 font-semibold' : 'text-white/80'
                        }`}
                      >
                        <span>Auto</span>
                        {currentQuality === -1 && <Check size={13} />}
                      </button>
                      {qualities.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => handleSelectQuality(q.id)}
                          className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors ${
                            currentQuality === q.id ? 'text-sky-400 font-semibold' : 'text-white/80'
                          }`}
                        >
                          <span>{q.label}</span>
                          {currentQuality === q.id && <Check size={13} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sleep Timer Menu */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSleepMenu(!showSleepMenu);
                    setShowQualityMenu(false);
                  }}
                  className={`p-2 rounded-xl transition-all ${
                    sleepTimerMinutes
                      ? 'bg-purple-600 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title="Sleep Timer"
                  aria-label="Sleep timer menu"
                >
                  <Moon size={18} />
                </button>

                {showSleepMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-36 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-white/10 shadow-2xl text-white text-xs z-50 animate-fade-in">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                      Sleep Timer
                    </div>
                    {[
                      { label: 'Turn Off', mins: null },
                      { label: '15 Minutes', mins: 15 },
                      { label: '30 Minutes', mins: 30 },
                      { label: '45 Minutes', mins: 45 },
                      { label: '60 Minutes', mins: 60 },
                      { label: '90 Minutes', mins: 90 },
                    ].map(({ label, mins }) => (
                      <button
                        key={label}
                        onClick={() => {
                          setSleepTimerMinutes(mins);
                          setShowSleepMenu(false);
                          if (mins) {
                            onShowToast?.({
                              type: 'info',
                              message: `Sleep timer set for ${mins} minutes`,
                            });
                          }
                        }}
                        className={`w-full px-3 py-1.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors ${
                          sleepTimerMinutes === mins ? 'text-purple-400 font-semibold' : 'text-white/80'
                        }`}
                      >
                        <span>{label}</span>
                        {sleepTimerMinutes === mins && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture Button */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePiP}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Picture-in-Picture (P)"
                  aria-label="Toggle Picture-in-Picture"
                >
                  <PictureInPicture size={18} />
                </button>
              )}

              {/* Theater Mode Button */}
              {onToggleTheater && (
                <button
                  onClick={onToggleTheater}
                  className="hidden md:flex p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title={isTheaterMode ? 'Exit Theater mode (T)' : 'Theater mode (T)'}
                  aria-label="Toggle Theater mode"
                >
                  {isTheaterMode ? <Shrink size={18} /> : <Expand size={18} />}
                </button>
              )}

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
