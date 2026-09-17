import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 px-4 py-3 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 text-slate-800 dark:text-slate-100 max-w-sm">
      {icons[toast.type || 'info']}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
