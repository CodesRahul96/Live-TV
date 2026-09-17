import { useState, useEffect, useCallback, useMemo } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { ChannelList } from './components/ChannelList';
import { CustomPlayer } from './components/CustomPlayer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { PlaylistModal } from './components/PlaylistModal';
import { Toast } from './components/Toast';
import { useChannels } from './hooks/useChannels';
import { Tv, Sparkles, Loader2 } from 'lucide-react';

function LiveTVApp() {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    channels: channelList,
    categories: categoriesList,
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
    testChannel,
  } = useChannels();

  // Toast Helper
  const showToast = useCallback(({ type = 'info', message, duration = 3500 }) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, duration);
  }, []);

  // Channel Selection
  const handleChannelSelect = useCallback((channel) => {
    if (!channel) return;
    setCurrentChannel(channel);
    addToHistory(channel);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [addToHistory]);

  // Channel Index for Prev / Next
  const currentIndex = useMemo(() => {
    if (!currentChannel || !channelList.length) return -1;
    return channelList.findIndex((c) => c.id === currentChannel.id);
  }, [currentChannel, channelList]);

  const hasPrevChannel = currentIndex > 0;
  const hasNextChannel = currentIndex !== -1 && currentIndex < channelList.length - 1;

  const handlePrevChannel = useCallback(() => {
    if (hasPrevChannel) {
      handleChannelSelect(channelList[currentIndex - 1]);
    }
  }, [hasPrevChannel, channelList, currentIndex, handleChannelSelect]);

  const handleNextChannel = useCallback(() => {
    if (hasNextChannel) {
      handleChannelSelect(channelList[currentIndex + 1]);
    }
  }, [hasNextChannel, channelList, currentIndex, handleChannelSelect]);

  // Error fallback handler
  const handlePlayerError = useCallback(() => {
    if (currentChannel && testChannel && currentChannel.id !== testChannel.id) {
      showToast({
        type: 'error',
        message: `Stream failed. Switching to fallback stream...`,
      });
      setCurrentChannel(testChannel);
    }
  }, [currentChannel, testChannel, showToast]);

  // Global '?' key listener for shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '?' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      ) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Restore last played channel when channelList is loaded
  useEffect(() => {
    if (channelList.length > 0 && !currentChannel) {
      const lastChannelId = localStorage.getItem('lastChannelId');
      const savedChannel = lastChannelId
        ? channelList.find((c) => c.id === lastChannelId)
        : null;

      if (savedChannel) {
        setCurrentChannel(savedChannel);
        addToHistory(savedChannel);
      } else {
        setCurrentChannel(channelList[0]);
        addToHistory(channelList[0]);
      }
    }
  }, [channelList, currentChannel, addToHistory]);

  // Save current channel ID to localStorage
  useEffect(() => {
    if (currentChannel && currentChannel.id !== 'test-channel') {
      try {
        localStorage.setItem('lastChannelId', currentChannel.id);
      } catch (e) {}
    }
  }, [currentChannel]);

  return (
    <Layout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      isSidebarCollapsed={isSidebarCollapsed}
      setIsSidebarCollapsed={setIsSidebarCollapsed}
      isTheaterMode={isTheaterMode}
      onOpenShortcuts={() => setIsShortcutsOpen(true)}
      onOpenPlaylistModal={() => setIsPlaylistModalOpen(true)}
      isCustomPlaylist={isCustomPlaylist}
      activeCategory={activeCategory}
      onSelectCategory={setActiveCategory}
      sidebar={
        <ChannelList
          channels={channelList}
          currentChannel={currentChannel}
          onSelectChannel={handleChannelSelect}
          categories={categoriesList}
          categoriesWithCounts={categoriesWithCounts}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          favorites={favorites}
          onToggleFavorite={(id) => {
            const willFav = !isFavorite(id);
            toggleFavorite(id);
            showToast({
              type: willFav ? 'success' : 'info',
              message: willFav ? 'Added to favorites' : 'Removed from favorites',
            });
          }}
          isFavorite={isFavorite}
          history={history}
          onClearHistory={() => {
            clearHistory();
            showToast({ type: 'info', message: 'Cleared recent channels history' });
          }}
          onShowToast={showToast}
        />
      }
    >
      <div className="flex-1 flex flex-col h-full bg-black relative">
        {/* Loading state before channels are loaded */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
            <p className="text-sm font-medium">Loading TV Channels...</p>
          </div>
        ) : currentChannel ? (
          <CustomPlayer
            key={currentChannel.id + '-' + currentChannel.src}
            src={currentChannel.src}
            poster={currentChannel.logo}
            title={currentChannel.name}
            category={currentChannel.category}
            onPrevChannel={handlePrevChannel}
            onNextChannel={handleNextChannel}
            hasPrevChannel={hasPrevChannel}
            hasNextChannel={hasNextChannel}
            isTheaterMode={isTheaterMode}
            onToggleTheater={() => setIsTheaterMode(!isTheaterMode)}
            onError={handlePlayerError}
            onShowToast={showToast}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
              <Tv size={32} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Select a Channel</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Choose any live channel from the sidebar or import your custom M3U playlist to start streaming.
            </p>
          </div>
        )}
      </div>

      {/* Modals & Toast */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <PlaylistModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        isCustomPlaylist={isCustomPlaylist}
        customSource={customSource}
        onSetCustomPlaylist={setCustomPlaylistData}
        onResetDefault={resetToDefaultPlaylist}
        onShowToast={showToast}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LiveTVApp />
    </ThemeProvider>
  );
}