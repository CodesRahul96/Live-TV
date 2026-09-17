import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle = ({ compact = false }) => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'system', label: 'System', icon: Laptop },
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const CurrentIcon = theme === 'system' ? Laptop : (resolvedTheme === 'dark' ? Moon : Sun);

  if (compact) {
    return (
      <div className="flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60">
        {options.map(({ value, icon: Icon, label }) => {
          const isActive = theme === value;
          return (
            <button
              key={value}
              onClick={() => setTheme(value)}
              title={`Switch to ${label} theme`}
              aria-label={`Switch to ${label} theme`}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center gap-1.5"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label="Toggle theme menu"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/15 z-50 animate-fade-in">
          {options.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => {
                setTheme(value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                theme === value
                  ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon size={14} />
                <span>{label}</span>
              </div>
              {theme === value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
