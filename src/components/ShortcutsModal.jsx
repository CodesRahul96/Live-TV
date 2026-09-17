import { Keyboard, X } from 'lucide-react';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space / K', description: 'Play / Pause stream' },
    { key: 'M', description: 'Mute / Unmute audio' },
    { key: 'F', description: 'Toggle Fullscreen mode' },
    { key: 'P', description: 'Toggle Picture-in-Picture (PiP)' },
    { key: 'T', description: 'Toggle Theater mode' },
    { key: '↑ / ↓', description: 'Increase / Decrease volume' },
    { key: '[ / ]', description: 'Previous / Next channel' },
    { key: 'R', description: 'Reload current channel stream' },
    { key: '/', description: 'Focus channel search bar' },
    { key: '?', description: 'Open this keyboard shortcuts help' },
    { key: 'Esc', description: 'Close modal / Exit fullscreen' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-800 dark:text-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <Keyboard size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-base">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quickly control playback & navigation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                {description}
              </span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-all shadow-md shadow-sky-500/25 active:scale-[0.99]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
