import { useState, useRef } from 'react';
import { Radio, Upload, Link as LinkIcon, RotateCcw, X, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

export const PlaylistModal = ({
  isOpen,
  onClose,
  isCustomPlaylist,
  customSource,
  onSetCustomPlaylist,
  onResetDefault,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState('url');
  const [urlInput, setUrlInput] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(urlInput.trim());
      if (!response.ok) {
        throw new Error(`Failed to fetch playlist (status ${response.status})`);
      }
      const text = await response.text();
      const result = onSetCustomPlaylist(text, urlInput.trim());
      if (result.success) {
        onShowToast?.({ type: 'success', message: `Loaded ${result.count} channels from custom URL!` });
        onClose();
      } else {
        setErrorMessage(result.error || 'Failed to parse M3U playlist.');
      }
    } catch (err) {
      setErrorMessage(`Network / CORS Error: ${err.message}. If CORS blocks the URL, you can download the .m3u file and upload it directly in the File tab.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const result = onSetCustomPlaylist(text, file.name);
        if (result.success) {
          onShowToast?.({ type: 'success', message: `Loaded ${result.count} channels from ${file.name}!` });
          onClose();
        } else {
          setErrorMessage(result.error || 'Failed to parse M3U file.');
        }
      }
      setIsLoading(false);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file.');
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleRawSubmit = (e) => {
    e.preventDefault();
    if (!rawInput.trim()) return;

    setIsLoading(true);
    const result = onSetCustomPlaylist(rawInput.trim(), 'Pasted Playlist');
    if (result.success) {
      onShowToast?.({ type: 'success', message: `Loaded ${result.count} channels!` });
      onClose();
    } else {
      setErrorMessage(result.error || 'Invalid playlist format.');
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    const count = onResetDefault();
    onShowToast?.({ type: 'info', message: `Reset to built-in playlist (${count} channels)` });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-800 dark:text-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-base">Manage Playlists (M3U)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCustomPlaylist ? `Active: ${customSource}` : 'Using built-in playlist'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close playlist modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current status banner */}
        {isCustomPlaylist && (
          <div className="mt-4 p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300">
              <CheckCircle2 size={16} className="shrink-0 text-purple-500" />
              <span>Using custom playlist</span>
            </div>
            <button
              onClick={handleReset}
              className="px-2.5 py-1 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw size={12} />
              Reset Default
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-4 flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1">
          <button
            onClick={() => { setActiveTab('url'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LinkIcon size={14} />
            M3U URL
          </button>
          <button
            onClick={() => { setActiveTab('file'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload size={14} />
            Upload File
          </button>
          <button
            onClick={() => { setActiveTab('paste'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'paste'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText size={14} />
            Paste M3U
          </button>
        </div>

        {/* Tab contents */}
        <div className="mt-4">
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Enter Public M3U / M3U8 Playlist URL
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/playlist.m3u"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
              />
              <button
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md shadow-sky-500/20"
              >
                {isLoading ? 'Loading & Parsing...' : 'Load Playlist from URL'}
              </button>
            </form>
          )}

          {activeTab === 'file' && (
            <div className="space-y-3 text-center">
              <input
                type="file"
                ref={fileInputRef}
                accept=".m3u,.m3u8,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-400 rounded-2xl p-6 cursor-pointer transition-colors group"
              >
                <Upload size={32} className="mx-auto text-slate-400 group-hover:text-sky-500 transition-colors" />
                <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  Click to choose <code className="text-sky-500 font-mono">.m3u</code> or <code className="text-sky-500 font-mono">.m3u8</code> file
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Supports standard IPTV playlist formats</p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <form onSubmit={handleRawSubmit} className="space-y-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Paste Raw M3U Content
              </label>
              <textarea
                rows={6}
                required
                placeholder="#EXTM3U&#10;#EXTINF:-1 group-title=&quot;News&quot;,My Channel&#10;https://example.com/stream.m3u8"
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all custom-scrollbar"
              />
              <button
                type="submit"
                disabled={isLoading || !rawInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md shadow-sky-500/20"
              >
                {isLoading ? 'Parsing Playlist...' : 'Import Playlist'}
              </button>
            </form>
          )}

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
