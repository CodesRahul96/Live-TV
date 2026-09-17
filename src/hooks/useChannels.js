import { useState, useEffect, useCallback, useMemo } from 'react';
import defaultPlaylistContent from '../assets/playlist.txt?raw';

const STORAGE_KEY_CUSTOM_PLAYLIST = 'live_tv_custom_playlist';
const STORAGE_KEY_FAVORITES = 'live_tv_favorites';
const STORAGE_KEY_HISTORY = 'live_tv_recent_history';

// Parse M3U text format into structured channel objects
export const parseM3U = (content) => {
  if (!content || typeof content !== 'string') return [];
  const lines = content.split(/\r?\n/);
  const channels = [];
  let tempChannel = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      tempChannel = {};
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      const nameCommaMatch = line.match(/,(.+)$/);

      if (logoMatch) tempChannel.logo = logoMatch[1];
      if (groupMatch) tempChannel.category = groupMatch[1].trim() || 'General';
      if (idMatch) tempChannel.tvgId = idMatch[1];
      if (nameCommaMatch) {
        tempChannel.name = nameCommaMatch[1].trim();
      } else {
        tempChannel.name = `Channel ${channels.length + 1}`;
      }

      if (!tempChannel.category) {
        tempChannel.category = 'General';
      }

      tempChannel.id = tempChannel.tvgId 
        ? `tvg-${tempChannel.tvgId}` 
        : `ch-${channels.length}-${tempChannel.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      if (!tempChannel) {
        tempChannel = {
          id: `ch-${channels.length}`,
          name: `Channel ${channels.length + 1}`,
          category: 'General'
        };
      }

      let src = line;
      // Ensure HLS format if applicable
      if (!src.includes('.m3u8') && !src.includes('manifest') && !src.includes('playlist')) {
        // Keep original unless required
      }

      tempChannel.src = src;
      tempChannel.type = 'application/x-mpegURL';

      if (tempChannel.name && tempChannel.src) {
        channels.push({
          ...tempChannel,
          logo: tempChannel.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(tempChannel.name)}`
        });
      }
      tempChannel = null;
    }
  }

  return channels;
};

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCustomPlaylist, setIsCustomPlaylist] = useState(false);
  const [customSource, setCustomSource] = useState('');

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Load playlist data
  const loadPlaylist = useCallback(() => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const customData = localStorage.getItem(STORAGE_KEY_CUSTOM_PLAYLIST);
        let parsed = [];
        if (customData) {
          try {
            const parsedObj = JSON.parse(customData);
            parsed = parseM3U(parsedObj.content);
            setIsCustomPlaylist(true);
            setCustomSource(parsedObj.source || 'Custom Playlist');
          } catch {
            parsed = parseM3U(customData);
            setIsCustomPlaylist(true);
            setCustomSource('Custom Playlist');
          }
        }

        if (!parsed || parsed.length === 0) {
          parsed = parseM3U(defaultPlaylistContent);
          setIsCustomPlaylist(false);
          setCustomSource('');
        }

        setChannels(parsed);
      } catch (err) {
        console.error('Failed to load playlist:', err);
        setError('Failed to parse channels from playlist.');
        // Fallback to default
        setChannels(parseM3U(defaultPlaylistContent));
      } finally {
        setIsLoading(false);
      }
    }, 20);
  }, []);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  // Save custom playlist
  const setCustomPlaylistData = (content, sourceName = 'Custom URL') => {
    try {
      const parsed = parseM3U(content);
      if (parsed.length === 0) {
        throw new Error('No valid channels found in playlist.');
      }
      localStorage.setItem(
        STORAGE_KEY_CUSTOM_PLAYLIST,
        JSON.stringify({ content, source: sourceName })
      );
      setChannels(parsed);
      setIsCustomPlaylist(true);
      setCustomSource(sourceName);
      return { success: true, count: parsed.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // Reset to default playlist
  const resetToDefaultPlaylist = () => {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_PLAYLIST);
    const parsed = parseM3U(defaultPlaylistContent);
    setChannels(parsed);
    setIsCustomPlaylist(false);
    setCustomSource('');
    return parsed.length;
  };

  // Toggle favorite
  const toggleFavorite = (channelId) => {
    setFavorites((prev) => {
      const next = prev.includes(channelId)
        ? prev.filter((id) => id !== channelId)
        : [...prev, channelId];
      try {
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save favorites', e);
      }
      return next;
    });
  };

  const isFavorite = (channelId) => favorites.includes(channelId);

  // Add to watch history
  const addToHistory = (channel) => {
    if (!channel || !channel.id) return;
    setHistory((prev) => {
      const filtered = prev.filter((id) => id !== channel.id);
      const next = [channel.id, ...filtered].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(next));
      } catch (e) {
        console.warn('Could not save history', e);
      }
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
    } catch (e) {
      console.warn('Could not clear history', e);
    }
  };

  // Compute categories with counts
  const categoriesWithCounts = useMemo(() => {
    const map = {};
    channels.forEach((c) => {
      const cat = c.category || 'General';
      map[cat] = (map[cat] || 0) + 1;
    });

    const categoryList = Object.keys(map).sort((a, b) => a.localeCompare(b));
    return [
      { name: 'All', count: channels.length },
      { name: 'Favorites', count: favorites.length },
      { name: 'Recent', count: history.length },
      ...categoryList.map((cat) => ({ name: cat, count: map[cat] }))
    ];
  }, [channels, favorites, history]);

  const categories = useMemo(() => {
    return categoriesWithCounts.map((c) => c.name);
  }, [categoriesWithCounts]);

  return {
    channels,
    categories,
    categoriesWithCounts,
    isLoading,
    error,
    favorites,
    toggleFavorite,
    isFavorite,
    history,
    addToHistory,
    clearHistory,
    isCustomPlaylist,
    customSource,
    setCustomPlaylistData,
    resetToDefaultPlaylist,
    testChannel: {
      id: 'test-channel',
      name: 'Fallback Test Stream (Big Buck Bunny)',
      category: 'Debug',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
      src: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
      type: 'application/x-mpegURL',
    },
  };
};
