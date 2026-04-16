import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatInput } from './components/chat/ChatInput';
import { SettingsModal } from './components/chat/SettingsModal';
import { InfoModal } from './components/chat/InfoModal';
import { ChatSession, Message, N8NConfig } from './types';
import { sendToN8N } from './services/n8nService';
import { Toaster, toast } from 'sonner';
import { Plus, Search, Settings, Coffee, Trash2, Palette, Info, Type } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from './lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STORAGE_KEY_SESSIONS = 'n8n_chat_sessions';
const STORAGE_KEY_CONFIG = 'n8n_chat_config';
const STORAGE_KEY_THEME = 'n8n_chat_theme';
const STORAGE_KEY_FONT_SIZE = 'n8n_chat_font_size';

type Theme = 'default' | 'white' | 'graphite' | 'orange' | 'purple';

const DEFAULT_CONFIG: N8NConfig = {
  profiles: [],
  activeProfileId: null,
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [config, setConfig] = useState<N8NConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('default');
  const [fontSize, setFontSize] = useState<number>(16);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const savedFontSize = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      document.documentElement.style.setProperty('--chat-font-size', `${size}px`);
    } else {
      document.documentElement.style.setProperty('--chat-font-size', '16px');
    }
  }, []);

  const handleFontSizeChange = (size: number) => {
    const newSize = Math.max(12, Math.min(28, size));
    setFontSize(newSize);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, newSize.toString());
    document.documentElement.style.setProperty('--chat-font-size', `${newSize}px`);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY_THEME, newTheme);
    if (newTheme === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeSelectorOpen(false);
      }
      if (isFontSizeSelectorOpen) {
        // We handle font size selector closing via the same logic if we wrap it in a ref or just close it when clicking outside
        // For simplicity, let's just close it if clicking outside the top nav area or add a specific ref
        setIsFontSizeSelectorOpen(false);
      }
    };

    if (isMenuOpen || isThemeSelectorOpen || isFontSizeSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isThemeSelectorOpen]);

  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    let initialConfig = DEFAULT_CONFIG;
    if (savedConfig) {
      initialConfig = JSON.parse(savedConfig);
      if (!(initialConfig as any).profiles) {
        const oldConfig = initialConfig as any;
        initialConfig = {
          profiles: [{
            id: 'default',
            name: 'Default Agent',
            webhookUrl: oldConfig.webhookUrl || '',
            authType: oldConfig.authType || 'none',
            authHeaderName: oldConfig.authHeaderName,
            authHeaderValue: oldConfig.authHeaderValue,
            authToken: oldConfig.authToken,
          }],
          activeProfileId: 'default',
        };
      }
      setConfig(initialConfig);
    } else {
      setIsSettingsOpen(true);
    }

    const savedSessions = localStorage.getItem(STORAGE_KEY_SESSIONS);
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSessionId(parsed[0].id);
      }
    } else {
      const firstProfileId = initialConfig.activeProfileId || (initialConfig.profiles.length > 0 ? initialConfig.profiles[0].id : 'default');
      handleNewChat(firstProfileId);
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const activeProfile = config.profiles.find(p => p.id === (currentSession?.profileId || config.activeProfileId));

  const handleNewChat = (profileId?: string) => {
    const targetProfileId = profileId || config.activeProfileId || (config.profiles.length > 0 ? config.profiles[0].id : 'default');
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      profileId: targetProfileId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      
      if (filtered.length === 0) {
        const targetProfileId = config.activeProfileId || (config.profiles.length > 0 ? config.profiles[0].id : 'default');
        const newSession: ChatSession = {
          id: crypto.randomUUID(),
          title: 'New Chat',
          messages: [],
          profileId: targetProfileId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setCurrentSessionId(newSession.id);
        return [newSession];
      }
      
      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }
      
      return filtered;
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId || !activeProfile || !activeProfile.webhookUrl) {
      toast.error('Vui lòng cấu hình Webhook URL của Agent trong Settings');
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newMessages = [...s.messages, userMessage];
        return {
          ...s,
          messages: newMessages,
          updatedAt: Date.now(),
          title: s.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : s.title,
        };
      }
      return s;
    }));

    setIsLoading(true);

    try {
      const response = await sendToN8N(content, currentSession?.messages || [], activeProfile);
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: [...s.messages, assistantMessage],
            updatedAt: Date.now(),
          };
        }
        return s;
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect to n8n');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = (newConfig: N8NConfig) => {
    setConfig(newConfig);
    if (currentSession && currentSession.messages.length === 0 && newConfig.activeProfileId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, profileId: newConfig.activeProfileId! } : s
      ));
    }
  };

  const filteredSessions = sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-bg text-text overflow-hidden font-sans relative">
        <Toaster position="top-center" richColors />
        
        {/* Top Right Navigation */}
        <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 flex items-center gap-3 md:gap-6 text-sm font-medium text-gray-500">
          <div ref={themeRef} className="flex items-center gap-2 md:gap-3">
            <AnimatePresence>
              {isThemeSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  className="flex items-center gap-1.5 md:gap-2 overflow-hidden pr-1 md:pr-2"
                >
                  {[
                    { id: 'default', color: '#f3f3f3', label: 'Mặc định' },
                    { id: 'white', color: '#ffffff', label: 'Trắng' },
                    { id: 'graphite', color: '#1a1a1a', label: 'Than chì' },
                    { id: 'orange', color: '#fffaf0', label: 'Cam nhạt' },
                    { id: 'purple', color: '#120d1d', label: 'Tím sang trọng' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleThemeChange(t.id as Theme)}
                      className={cn(
                        "w-5 h-5 md:w-6 md:h-6 rounded-full border transition-all hover:scale-110",
                        theme === t.id ? "scale-110" : "border-border"
                      )}
                      style={{ backgroundColor: t.color }}
                      title={t.label}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
              className={cn(
                "hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5",
                isThemeSelectorOpen && "text-brand"
              )} 
              title="Đổi màu nền"
            >
              <Palette size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <AnimatePresence>
              {isFontSizeSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  className="flex items-center gap-2 overflow-hidden pr-2"
                >
                  <button 
                    onClick={() => handleFontSizeChange(fontSize - 2)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-surface hover:bg-surface-hover border border-border text-text text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-mono w-4 text-center">{fontSize}</span>
                  <button 
                    onClick={() => handleFontSizeChange(fontSize + 2)}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-surface hover:bg-surface-hover border border-border text-text text-xs"
                  >
                    +
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => setIsFontSizeSelectorOpen(!isFontSizeSelectorOpen)}
              className={cn(
                "hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5",
                isFontSizeSelectorOpen && "text-brand"
              )} 
              title="Cỡ chữ"
            >
              <Type size={18} />
            </button>
          </div>

          <button className="hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5">
            <Coffee size={18} />
            <span className="hidden sm:inline">Mời Cafe</span>
          </button>

          <button 
            onClick={() => setIsInfoOpen(true)}
            className="hover:text-brand transition-colors flex items-center gap-2 p-1.5"
            title="Thông tin bảo mật"
          >
            <Info size={18} />
            <span className="hidden sm:inline">Info</span>
          </button>
        </div>

        {/* Top Left Floating Menu */}
        <div ref={menuRef} className="absolute top-4 left-4 md:top-6 md:left-6 z-40 flex flex-col gap-4 w-[calc(100%-2rem)] md:w-80 pointer-events-none">
          {/* Logo & Agent Selector Row */}
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 flex items-center justify-center bg-surface hover:bg-surface-hover rounded-xl transition-colors flex-shrink-0 shadow-sm"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text">
                <path d="M4 16c4-8 12-8 16 0" />
              </svg>
            </button>

            {/* Agent Selector Always Visible */}
            {config.profiles.length > 0 && (
              <Select 
                value={currentSession?.profileId || config.activeProfileId || ''} 
                onValueChange={(val) => {
                  if (currentSession) {
                    setSessions(prev => prev.map(s => 
                      s.id === currentSessionId ? { ...s, profileId: val } : s
                    ));
                  }
                }}
              >
                <SelectTrigger className="px-3 md:px-4 py-2 border-none shadow-sm focus:ring-0 bg-surface hover:bg-surface-hover rounded-xl h-10 w-auto min-w-[100px] md:min-w-[120px] flex gap-2 font-medium">
                  <div className="truncate max-w-[100px] md:max-w-[150px] text-sm md:text-base">
                    {config.profiles.find(p => p.id === (currentSession?.profileId || config.activeProfileId))?.name || "Select Agent"}
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-surface border-border text-text shadow-sm rounded-xl z-[70]">
                  {config.profiles.map(p => (
                    <SelectItem key={p.id} value={p.id} className="cursor-pointer hover:bg-surface-hover rounded-lg">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* New Chat Button */}
            <button
              onClick={() => handleNewChat()}
              className="w-10 h-10 flex items-center justify-center bg-surface hover:bg-surface-hover rounded-xl transition-colors flex-shrink-0 text-brand shadow-sm"
              title="New Chat"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Dropdown Content (Search + History + New Agent) */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 pointer-events-auto mt-2"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-light transition-all shadow-sm text-text placeholder-gray-400"
                  />
                </div>

                {/* History List */}
                <ScrollArea className="h-[calc(100vh-320px)] md:h-[calc(100vh-200px)]">
                  <div className="space-y-4 pb-4 pr-3">
                    {filteredSessions.length === 0 ? (
                      <div className="text-center py-8 text-text-muted text-sm italic">
                        No chats found
                      </div>
                    ) : (
                      filteredSessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "w-full text-left p-4 md:p-5 rounded-2xl transition-all duration-200 group flex flex-col bg-surface hover:shadow-md relative",
                            currentSessionId === session.id 
                              ? "shadow-md bg-surface-hover" 
                              : "shadow-sm opacity-95 hover:opacity-100"
                          )}
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              setCurrentSessionId(session.id);
                              if (window.innerWidth < 768) setIsMenuOpen(false);
                            }}
                          >
                            <div className="font-medium text-text text-sm md:text-base truncate w-full pr-8">
                              {session.title}
                            </div>
                            <div className="text-xs md:text-sm text-text-muted font-light mt-4 md:mt-6">
                              {new Date(session.updatedAt).toLocaleDateString('en-GB', {
                                year: '2-digit',
                                month: '2-digit',
                                day: '2-digit'
                              }).replace(/\//g, '/')}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Delete chat"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* New Agent Button */}
                <Button 
                  variant="ghost" 
                  className="w-full h-12 md:h-14 justify-start gap-3 text-brand hover:text-brand hover:bg-brand-light/40 rounded-2xl bg-brand-light/20 shadow-sm border border-brand/10"
                  onClick={() => {
                    setIsSettingsOpen(true);
                    if (window.innerWidth < 768) setIsMenuOpen(false);
                  }}
                >
                  <Plus size={20} />
                  <span className="font-semibold">New Agent</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <main className="flex-grow flex flex-col relative h-full overflow-hidden bg-transparent">
          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto px-4 md:px-12 pt-20 md:pt-24">
            {currentSession?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-4xl md:text-6xl font-serif italic text-text/90 font-light tracking-tight">
                    How can I help you?
                  </h1>
                  <p className="text-text-muted text-lg md:text-xl font-light max-w-md mx-auto">
                    Chọn một Agent và bắt đầu cuộc trò chuyện của bạn.
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="flex flex-col max-w-5xl w-full mx-auto pb-32">
                <AnimatePresence initial={false}>
                  {currentSession?.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChatMessage 
                        message={message} 
                        agentName={config.profiles.find(p => p.id === (currentSession?.profileId || config.activeProfileId))?.name}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-10" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="absolute bottom-0 left-0 w-full flex justify-center z-20 bg-gradient-to-t from-bg via-bg to-transparent pt-10 pb-4 md:pb-6 pointer-events-none">
            <div className="w-full max-w-5xl px-4 md:px-12 pointer-events-auto">
              <ChatInput 
                onSend={handleSendMessage} 
                isLoading={isLoading} 
                disabled={false}
              />
            </div>
          </div>
        </main>

        <SettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          config={config}
          onSave={handleUpdateConfig}
        />

        <InfoModal
          open={isInfoOpen}
          onOpenChange={setIsInfoOpen}
        />
      </div>
    </TooltipProvider>
  );
}




