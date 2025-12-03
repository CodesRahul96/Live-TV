import React from 'react';
import { Play, Monitor } from 'lucide-react';

export const ChannelList = ({ channels, currentChannel, onSelectChannel, categories, activeCategory, onSelectCategory }) => {
  const filteredChannels = activeCategory === 'All' 
    ? channels 
    : channels.filter(c => c.category === activeCategory);

  return (
    <div className="h-full flex flex-col bg-dark-card/50 backdrop-blur-md border-r border-white/5">
      {/* Categories */}
      <div className="p-4 border-b border-white/5 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === category 
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-white/5 text-dark-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Channel Grid/List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth" style={{ contentVisibility: 'auto' }}>
        {filteredChannels.map(channel => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className={`w-full group flex items-center gap-4 p-3 rounded-xl transition-all animate-fade-in ${
              currentChannel?.id === channel.id
                ? 'bg-primary-500/10 border border-primary-500/50'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black/20 shrink-0">
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="w-full h-full object-contain p-1"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/150?text=TV';
                }}
              />
              {currentChannel?.id === channel.id && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div className="flex-1 text-left">
              <h3 className={`font-medium truncate ${
                currentChannel?.id === channel.id ? 'text-primary-400' : 'text-dark-text group-hover:text-white'
              }`}>
                {channel.name}
              </h3>
              <span className="text-xs text-dark-muted">{channel.category}</span>
            </div>

            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              currentChannel?.id === channel.id 
                ? 'bg-primary-500 text-white opacity-100' 
                : 'bg-white/10 text-white/50 opacity-0 group-hover:opacity-100'
            }`}>
              <Play size={14} fill="currentColor" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
