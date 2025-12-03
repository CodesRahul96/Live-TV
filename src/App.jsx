import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ChannelList } from './components/ChannelList';
import { CustomPlayer } from './components/CustomPlayer';
import { useChannels } from './hooks/useChannels';

function App() {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { channels: channelList, categories: categoriesList, isLoading, testChannel } = useChannels();

  const handleChannelSelect = (channel) => {
    setCurrentChannel(channel);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handlePlayerError = () => {
    if (currentChannel && testChannel && currentChannel.id !== testChannel.id) {
      console.warn("Channel failed to play, switching to fallback.");
      setCurrentChannel(testChannel);
    }
  };

  // Restore last played channel when channels are loaded
  useEffect(() => {
    if (channelList.length > 0 && !currentChannel) {
      const lastChannelId = localStorage.getItem('lastChannelId');
      const savedChannel = lastChannelId ? channelList.find(c => c.id === lastChannelId) : null;

      if (savedChannel) {
        setCurrentChannel(savedChannel);
        if (savedChannel.category) setActiveCategory(savedChannel.category);
      } else {
        setCurrentChannel(channelList[0]);
      }
    }
  }, [channelList, currentChannel]);

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
          
          {/* Loading State / Footer */}
          {isLoading && (
            <div className="p-2 border-t border-white/5 text-center text-xs text-white/50">
              Loading channels...
            </div>
          )}
        </div>
      }
    >
      <div className="flex-1 flex flex-col h-full bg-black relative">
        {/* Video Player Container */}
        <div className="flex-1 relative w-full h-full">
          {currentChannel ? (
            <>
              <CustomPlayer 
                key={currentChannel.id}
                src={currentChannel.src}
                poster={currentChannel.logo}
                title={currentChannel.name}
                onError={handlePlayerError}
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