import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Play, 
  Search, 
  Star, 
  Clock, 
  SlidersHorizontal, 
  X, 
  Radio, 
  Tv, 
  Trash2,
  Share2,
  Sparkles
} from 'lucide-react';

export const ChannelList = ({
  channels = [],
  currentChannel,
  onSelectChannel,
  categories = [],
  categoriesWithCounts = [],
  activeCategory = 'All',
  onSelectCategory,
  favorites = [],
  onToggleFavorite,
  isFavorite,
  history = [],
  onClearHistory,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default'); // 'default', 'az'
  const searchInputRef = useRef(null);
  const listContainerRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & sort channels
  const filteredChannels = useMemo(() => {
    let list = [...channels];

    // Category filter
    if (activeCategory === 'Favorites') {
      list = list.filter((c) => favorites.includes(c.id));
    } else if (activeCategory === 'Recent') {
      const historyMap = new Map(history.map((id, index) => [id, index]));
      list = list
        .filter((c) => historyMap.has(c.id))
        .sort((a, b) => historyMap.get(a.id) - historyMap.get(b.id));
    } else if (activeCategory !== 'All') {
      list = list.filter((c) => c.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.category && c.category.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [channels, activeCategory, favorites, history, searchQuery, sortOrder]);

  const handleCopyLink = (e, channel) => {
    e.stopPropagation();
    if (channel.src) {
      navigator.clipboard.writeText(channel.src);
      onShowToast?.({
        type: 'success',
        message: `Copied stream link for "${channel.name}"`,
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80">
      {/* Top Search & Filter Area */}
      <div className="p-3.5 pb-2 space-y-2.5">
        {/* Search input with clear button & shortcut hint */}
        <div className="relative flex items-center">
          <Search
            className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none"
            size={16}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search channels & categories... (/)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 rounded border border-slate-300/60 dark:border-slate-600/60">
              /
            </kbd>
          )}
        </div>

        {/* Action / Sort bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-medium">
            {filteredChannels.length} {filteredChannels.length === 1 ? 'channel' : 'channels'}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSortOrder(sortOrder === 'default' ? 'az' : 'default')}
              className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                sortOrder === 'az'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
              }`}
              title="Toggle sort alphabetical / default"
            >
              <SlidersHorizontal size={12} />
              <span>{sortOrder === 'az' ? 'A-Z' : 'Default'}</span>
            </button>

            {activeCategory === 'Recent' && history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-2 py-1 rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all flex items-center gap-1"
                title="Clear recent watch history"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Horizontal Scrollbar */}
      <div className="px-3.5 pb-2.5 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
        <div className="flex gap-1.5">
          {categoriesWithCounts.map(({ name, count }) => {
            const isActive = activeCategory === name;
            let Icon = null;
            if (name === 'Favorites') Icon = Star;
            if (name === 'Recent') Icon = Clock;
            if (name === 'All') Icon = Radio;

            return (
              <button
                key={name}
                onClick={() => onSelectCategory(name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {Icon && <Icon size={12} className={isActive ? 'text-white' : 'text-slate-400'} />}
                <span>{name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel List Items */}
      <div
        ref={listContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar"
      >
        {filteredChannels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              {activeCategory === 'Favorites' ? (
                <Star size={24} />
              ) : activeCategory === 'Recent' ? (
                <Clock size={24} />
              ) : (
                <Tv size={24} />
              )}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No channels found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {searchQuery
                ? `No channels matching "${searchQuery}"`
                : activeCategory === 'Favorites'
                ? 'Star any channel to add it to your favorites list'
                : activeCategory === 'Recent'
                ? 'Play any channel to build your recent history'
                : 'No channels available in this category'}
            </p>
          </div>
        ) : (
          filteredChannels.map((channel) => {
            const isSelected = currentChannel?.id === channel.id;
            const fav = isFavorite?.(channel.id);

            return (
              <div
                key={channel.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectChannel(channel)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectChannel(channel);
                  }
                }}
                className={`w-full group relative flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/40 shadow-xs'
                    : 'bg-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {/* Channel Logo */}
                <div className="relative w-12 h-10 rounded-xl overflow-hidden bg-slate-200/60 dark:bg-slate-800 shrink-0 flex items-center justify-center p-1 border border-slate-200/50 dark:border-slate-700/50">
                  <img
                    src={channel.logo}
                    alt={channel.name}
                    loading="lazy"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(channel.name)}`;
                    }}
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Channel Details */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <h4
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        isSelected
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-sky-500 transition-colors'
                      }`}
                    >
                      {channel.name}
                    </h4>
                    {isSelected && (
                      <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-500 text-white tracking-wider uppercase shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {channel.category || 'General'}
                  </p>
                </div>

                {/* Right Action Icons (Star Favorite, Copy, Play Indicator) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(channel.id);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      fav
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                    }`}
                    title={fav ? 'Remove from favorites' : 'Add to favorites'}
                    aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star size={15} fill={fav ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => handleCopyLink(e, channel)}
                    className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-700 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy stream link"
                    aria-label="Copy stream link"
                  >
                    <Share2 size={13} />
                  </button>

                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-400 group-hover:text-sky-500 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Play size={12} fill="currentColor" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
