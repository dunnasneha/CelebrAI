import React from 'react';
import { Sparkles, Plus, Calendar, LayoutDashboard, Home } from 'lucide-react';
import { isAIAvailable } from '../services/aiService';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, eventId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const aiReady = isAIAvailable();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E2D8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E1065] to-[#5B21B6] flex items-center justify-center text-[#F59E0B] shadow-md shadow-purple-950/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-tight bg-gradient-to-r from-[#2E1065] to-[#7C3AED] bg-clip-text text-transparent block">
                CelebrAI
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase -mt-1 block">
                Event Intelligence
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onNavigate('landing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-[#FAF5FF] text-[#2E1065]'
                  : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-[#FAF7F2]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#FAF5FF] text-[#2E1065]'
                  : 'text-[#4B5563] hover:text-[#2E1065] hover:bg-[#FAF7F2]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('create')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#2E1065] text-white hover:bg-[#4C1D95] shadow-xs transition-all hover:shadow-md cursor-pointer ml-1 sm:ml-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
