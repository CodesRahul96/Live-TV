import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChannelList } from './components/ChannelList';
import { VideoPlayer } from './components/VideoPlayer';
import { RefreshCw } from 'lucide-react';
import playlistContent from './assets/playlist.txt?raw';

function App() {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [channelList, setChannelList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const loadChannels = () => {
    setIsLoading(true);
    try {
      console.log('Loading channels from local playlist...');
      const lines = playlistContent.split('\n');
      const newChannels = [];
      let tempChannel = {};
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF:')) {
          tempChannel = {};
          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          const groupMatch = line.match(/group-title="([^"]*)"/);
          const nameMatch = line.match(/,(.+)$/);
          
          if (logoMatch) tempChannel.logo = logoMatch[1];
          if (groupMatch) tempChannel.category = groupMatch[1] || 'Uncategorized';
          if (nameMatch) tempChannel.name = nameMatch[1].trim();
          tempChannel.id = `local-${newChannels.length}`;
        } else if (line.startsWith('http')) {
          // Use proxy for development to avoid CORS/Mixed Content
          let src = line;
          if (import.meta.env.DEV) {
             src = line.replace(/http:\/\/agh2019\.xyz(:80)?/, '/xtream');
             console.log(`Transformed URL: ${line} -> ${src}`);
          }
          
          // Force HLS format if not present
          if (!src.endsWith('.m3u8')) {
            src += '.m3u8';
          }
          
          tempChannel.src = src;
          tempChannel.type = 'application/x-mpegURL';
          if (tempChannel.name) newChannels.push(tempChannel);
        }
      }
      
      setChannelList(newChannels);
      const cats = ['All', ...new Set(newChannels.map(c => c.category).filter(Boolean))];
      setCategoriesList(cats);
      
      // Restore last played channel
      const lastChannelId = localStorage.getItem('lastChannelId');
      const savedChannel = lastChannelId ? newChannels.find(c => c.id === lastChannelId) : null;
      
      if (newChannels.length > 0) {
        if (savedChannel) {
          setCurrentChannel(savedChannel);
          // Also set category if needed, or keep 'All'
          if (savedChannel.category) setActiveCategory(savedChannel.category);
        } else if (!currentChannel) {
          setCurrentChannel(newChannels[0]);
        }
      }
      
    } catch (error) {
      console.error('Error loading channels:', error);
      alert('Failed to load local playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  // Save current channel to localStorage
  useEffect(() => {
    if (currentChannel) {
      localStorage.setItem('lastChannelId', currentChannel.id);
    }
  }, [currentChannel]);

  return (
    <Layout
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      sidebar={
        <div className="flex flex-col h-full bg-dark-card/50 backdrop-blur-md border-r border-white/5">
          {/* Channel List */}
          <div className="flex-1 overflow-hidden">
            <ChannelList 
              channels={channelList}
              currentChannel={currentChannel}
              onSelectChannel={handleChannelSelect}
              categories={categoriesList}
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          </div>
          
          {/* Refresh Control */}
          <div className="p-2 border-t border-white/5">
             <button
              onClick={loadChannels}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs transition-all"
            >
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Loading...' : 'Refresh Playlist'}
            </button>
          </div>
        </div>
      }
    >
      <div className="flex-1 flex flex-col h-full bg-black relative">
        {/* Video Player Container */}
        <div className="flex-1 relative w-full h-full">
          {currentChannel ? (
            <>
              <VideoPlayer 
                key={currentChannel.id}
                src={currentChannel.src}
                type={currentChannel.type}
                drm={currentChannel.drm}
                poster={currentChannel.logo}
              />
              
              {/* Overlay Info */}
              <div className="absolute top-0 left-0 w-full p-6 bg-linear-to-b from-black/80 to-transparent pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300">
                <h1 className="text-2xl font-bold text-white drop-shadow-md">{currentChannel.name}</h1>
                <p className="text-white/70 text-sm">{currentChannel.category}</p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">
              <p>Select a channel to start watching</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default App;
