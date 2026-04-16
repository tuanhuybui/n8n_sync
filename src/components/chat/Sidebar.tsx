import React from 'react';
import { ChatSession } from '../../types';
import { Settings, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onOpenSettings,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-transparent pt-2">
      {/* Search Bar */}
      <div className="pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-surface border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition-all shadow-sm text-text placeholder-gray-400"
          />
        </div>
      </div>

      {/* Sessions List */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 pb-4">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "w-full text-left p-5 rounded-2xl transition-all duration-200 group flex flex-col gap-6 bg-surface hover:shadow-md",
                currentSessionId === session.id 
                  ? "ring-2 ring-brand-light shadow-md" 
                  : "shadow-sm opacity-95 hover:opacity-100"
              )}
            >
              <div className="font-medium text-text text-base truncate w-full">
                {session.title}
              </div>
              <div className="text-sm text-gray-500 font-light">
                {new Date(session.updatedAt).toLocaleDateString('en-GB', {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit'
                }).replace(/\//g, '/')}
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom Settings */}
      <div className="pt-4 mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-text-muted hover:text-text hover:bg-surface rounded-xl"
          onClick={onOpenSettings}
        >
          <Settings size={18} />
          <span className="font-medium">Settings</span>
        </Button>
      </div>
    </div>
  );
};


