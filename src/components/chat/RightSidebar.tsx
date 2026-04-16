import React, { useState } from 'react';
import { Zap, History, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'past' | 'future'>('future');

  const suggestions = [
    "Predict my busiest weeks based on my calendar trends.",
    "Predict questions I might receive for my next presentation.",
    "What should I focus on improving based on last year's mistakes?"
  ];

  return (
    <div className="hidden lg:flex flex-col h-full bg-bg w-72 border-l border-border p-4">
      {/* Tabs */}
      <div className="flex bg-surface/50 rounded-full p-1 mb-6">
        <button
          onClick={() => setActiveTab('past')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all",
            activeTab === 'past' ? "bg-surface-hover text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
          )}
        >
          <History size={14} />
          PAST
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-xs font-bold transition-all",
            activeTab === 'future' ? "bg-brand text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
          )}
        >
          <Sparkles size={14} />
          FUTURE
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {suggestions.map((text, i) => (
          <div 
            key={i}
            className="group p-4 rounded-2xl bg-surface/30 border border-white/5 hover:border-brand/30 hover:bg-surface/50 transition-all cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center mb-3 group-hover:bg-brand/20 transition-colors">
              <Zap size={12} className="text-gray-400 group-hover:text-brand transition-colors" />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed group-hover:text-white transition-colors">
              {text}
            </p>
            <div className="mt-4 text-[10px] font-bold text-brand uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Future
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4">
        <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10">
          <p className="text-xs text-brand/80 font-medium">
            New insights available based on your recent activity.
          </p>
        </div>
      </div>
    </div>
  );
};
