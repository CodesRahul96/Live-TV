import React, { useState } from 'react';
import { Menu, X, Tv, Smartphone, Monitor } from 'lucide-react';

export const Layout = ({ children, sidebar, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div className="h-screen w-screen bg-dark-bg text-dark-text overflow-hidden flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-dark-card/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
            <Tv size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Live<span className="text-primary-400">TV</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-dark-bg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 pt-16 md:pt-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Desktop Logo */}
          <div className="hidden md:flex h-16 items-center gap-3 px-6 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Tv size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Live<span className="text-primary-400">TV</span></span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {sidebar}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
};
