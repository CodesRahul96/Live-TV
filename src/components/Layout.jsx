import { 
  Tv, 
  Menu, 
  X, 
  Keyboard, 
  Radio, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Sparkles,
  Star,
  Clock,
  List
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Layout = ({
  children,
  sidebar,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isTheaterMode,
  onOpenShortcuts,
  onOpenPlaylistModal,
  isCustomPlaylist,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col transition-colors duration-200">
      {/* Universal Top Header */}
      <header className="h-14 sm:h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 z-40 transition-colors">
        {/* Brand Logo & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Toggle Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle mobile channel drawer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Sidebar Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/25">
              <Tv size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  LiveTV
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </div>
              <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block font-medium">
                Free Live Stream Web Hub
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls (Playlist, Shortcuts, Theme) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Custom Playlist Button */}
          <button
            onClick={onOpenPlaylistModal}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isCustomPlaylist
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Import custom M3U playlist"
            aria-label="Manage playlists"
          >
            <Radio size={15} />
            <span className="hidden sm:inline">
              {isCustomPlaylist ? 'Custom M3U' : 'Playlists'}
            </span>
          </button>

          {/* Keyboard Shortcuts Button */}
          <button
            onClick={onOpenShortcuts}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard size={18} />
          </button>

          {/* Theme Switcher Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Body with Split Sidebar & Player Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden md:block transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
            isTheaterMode || isSidebarCollapsed ? 'w-0 opacity-0 pointer-events-none' : 'w-80 lg:w-96 opacity-100'
          }`}
        >
          {sidebar}
        </aside>

        {/* Mobile Drawer (Slide-in) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white dark:bg-slate-900 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl pt-14 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar}
        </aside>

        {/* Backdrop overlay for mobile drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Video Player & Main Stage */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Quick Bar */}
      <nav className="md:hidden h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shrink-0 z-30">
        <button
          onClick={() => {
            onSelectCategory?.('All');
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeCategory === 'All'
              ? 'text-sky-500 dark:text-sky-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <List size={16} />
          <span>All</span>
        </button>

        <button
          onClick={() => {
            onSelectCategory?.('Favorites');
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeCategory === 'Favorites'
              ? 'text-amber-500'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Star size={16} />
          <span>Favorites</span>
        </button>

        <button
          onClick={() => {
            onSelectCategory?.('Recent');
            setIsSidebarOpen(true);
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeCategory === 'Recent'
              ? 'text-sky-500 dark:text-sky-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Clock size={16} />
          <span>Recents</span>
        </button>

        <button
          onClick={onOpenPlaylistModal}
          className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400"
        >
          <Radio size={16} />
          <span>M3U</span>
        </button>
      </nav>
    </div>
  );
};
