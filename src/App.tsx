import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/chat/ChatMessage';
import { ChatInput } from './components/chat/ChatInput';
import { SettingsModal } from './components/chat/SettingsModal';
import { InfoPopover } from './components/chat/InfoPopover';
import { CoffeePopover } from './components/chat/CoffeePopover';
import { ConfigGuide } from './components/chat/ConfigGuide';
import { ChatSession, Message, N8NConfig } from './types';
import { sendToN8N } from './services/n8nService';
import { Toaster, toast } from 'sonner';
import { Plus, Search, Settings, Coffee, Trash2, Palette, Info, Type, ChevronDown, CaseSensitive } from 'lucide-react';
import { Button } from '@/components/ui/ui-button';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
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
const STORAGE_KEY_FONT_FAMILY = 'n8n_chat_font_family';

type Theme = 'default' | 'white' | 'graphite' | 'orange' | 'purple';
type FontFamily = 'modern' | 'elegant' | 'technical' | 'friendly';

const DEFAULT_CONFIG: N8NConfig = {
  profiles: [],
  activeProfileId: null,
};

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [config, setConfig] = useState<N8NConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('default');
  const [fontSize, setFontSize] = useState<number>(16);
  const [fontFamily, setFontFamily] = useState<FontFamily>('modern');
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isFontSizeSelectorOpen, setIsFontSizeSelectorOpen] = useState(false);
  const [isFontSelectorOpen, setIsFontSelectorOpen] = useState(false);
  const [headerView, setHeaderView] = useState<'agent' | 'action'>('agent');
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUserScrolledRef = useRef(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const fontSizeRef = useRef<HTMLDivElement>(null);
  const fontFamilyRef = useRef<HTMLDivElement>(null);

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

    const savedFontFamily = localStorage.getItem(STORAGE_KEY_FONT_FAMILY) as FontFamily;
    if (savedFontFamily) {
      setFontFamily(savedFontFamily);
      document.documentElement.style.setProperty('--font-current', `var(--font-${savedFontFamily})`);
    }
  }, []);

  const handleFontSizeChange = (size: number) => {
    const newSize = Math.max(12, Math.min(28, size));
    setFontSize(newSize);
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, newSize.toString());
    document.documentElement.style.setProperty('--chat-font-size', `${newSize}px`);
  };

  const handleFontChange = (font: FontFamily) => {
    setFontFamily(font);
    localStorage.setItem(STORAGE_KEY_FONT_FAMILY, font);
    document.documentElement.style.setProperty('--font-current', `var(--font-${font})`);
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
      if (fontSizeRef.current && !fontSizeRef.current.contains(event.target as Node)) {
        setIsFontSizeSelectorOpen(false);
      }
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(event.target as Node)) {
        setIsFontSelectorOpen(false);
      }
    };

    if (isMenuOpen || isThemeSelectorOpen || isFontSizeSelectorOpen || isFontSelectorOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isThemeSelectorOpen, isFontSizeSelectorOpen, isFontSelectorOpen]);

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
            name: 'Chat IU Agent',
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
      // Removed automatic currentSessionId setting here as the activeProfileId logic will handle it
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
    if (messagesEndRef.current && !isUserScrolledRef.current) {
      // Use 'auto' instead of 'smooth' to prevent stuttering/cancellation during rapid state updates from streaming
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [sessions, currentSessionId]);

  const scrollToBottom = () => {
    isUserScrolledRef.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 150;
    setShowScrollButton(!isAtBottom);
    isUserScrolledRef.current = !isAtBottom;
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const activeProfile = config.profiles.find(p => p.id === config.activeProfileId);

  useEffect(() => {
    if (!config.activeProfileId) return;
    
    // Always start a new chat when switching agents for a fresh experience
    handleNewChat(config.activeProfileId);
  }, [config.activeProfileId]);

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
    isUserScrolledRef.current = false; // Force auto-scroll when user sends message
    setTimeout(scrollToBottom, 50);

    // Prepare an empty assistant message to be filled by the stream
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    try {
      let firstChunk = true;
      const response = await sendToN8N(
        content, 
        currentSession?.messages || [], 
        activeProfile, 
        currentSessionId,
        (currentFullText) => {
          if (firstChunk) {
            setIsLoading(false);
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
            firstChunk = false;
          }

          setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
              return {
                ...s,
                messages: s.messages.map(m => 
                  m.id === assistantMessageId ? { ...m, content: currentFullText } : m
                ),
                updatedAt: Date.now(),
              };
            }
            return s;
          }));
        }
      );
      
      // If it wasn't a stream (one-shot response), ensure the final message is set
      if (firstChunk) {
        setIsLoading(false);
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: [...s.messages, { ...assistantMessage, content: response }],
              updatedAt: Date.now(),
            };
          }
          return s;
        }));
      } else {
        // Just make sure the final text matches precisely (in case extractMessageFromData changed it)
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => 
                m.id === assistantMessageId ? { ...m, content: response } : m
              ),
              updatedAt: Date.now(),
            };
          }
          return s;
        }));
      }
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error.message || 'Failed to connect to n8n');
      console.error(error);
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

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const filteredSessions = sessions
    .filter(s => s.profileId === config.activeProfileId)
    .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-bg text-text overflow-hidden font-sans relative">
        <Toaster position="top-center" richColors />
        
        {/* Top Right Navigation */}
        <div className="absolute top-2 right-4 md:top-3 md:right-8 z-20 flex items-center h-10 gap-3 md:gap-6 text-sm font-medium text-gray-500">
          <div ref={themeRef} className="flex items-center gap-2 md:gap-3">
            <AnimatePresence>
              {isThemeSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  className="flex items-center gap-1.5 md:gap-2 overflow-hidden px-1 md:pr-2"
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
                        "w-5 h-5 md:w-6 md:h-6 rounded-full border transition-all cursor-pointer",
                        theme === t.id ? "border-brand border-2 shadow-sm" : "border-border"
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
              <Palette size={18} strokeWidth={1.2} />
            </button>
          </div>

          <div ref={fontSizeRef} className="flex items-center gap-2 md:gap-3">
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
              onClick={() => {
                setIsFontSizeSelectorOpen(!isFontSizeSelectorOpen);
                setIsFontSelectorOpen(false);
              }}
              className={cn(
                "hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5",
                isFontSizeSelectorOpen && "text-brand"
              )} 
              title="Cỡ chữ"
            >
              <Type size={18} strokeWidth={1.2} />
            </button>
          </div>

          <div ref={fontFamilyRef} className="flex items-center gap-2 md:gap-3">
            <AnimatePresence>
              {isFontSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: 'auto' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  className="flex items-center gap-2 overflow-hidden px-1"
                >
                  {[
                    { id: 'modern', label: 'Mod', font: 'var(--font-modern)' },
                    { id: 'elegant', label: 'Ele', font: 'var(--font-elegant)' },
                    { id: 'technical', label: 'Tec', font: 'var(--font-technical)' },
                    { id: 'friendly', label: 'Sof', font: 'var(--font-friendly)' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFontChange(f.id as FontFamily)}
                      className={cn(
                        "px-2 py-1 rounded-md text-[10px] uppercase tracking-tighter transition-all border",
                        fontFamily === f.id ? "bg-brand text-white border-transparent" : "bg-surface hover:bg-surface-hover border-border text-text-muted"
                      )}
                      style={{ fontFamily: f.font }}
                    >
                      {f.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            
            <button 
              onClick={() => {
                setIsFontSelectorOpen(!isFontSelectorOpen);
                setIsFontSizeSelectorOpen(false);
              }}
              className={cn(
                "hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5",
                isFontSelectorOpen && "text-brand"
              )} 
              title="Phông chữ"
            >
              <CaseSensitive size={20} strokeWidth={1.2} />
            </button>
          </div>

          <Popover>
            <PopoverTrigger 
              className="hover:text-gray-800 transition-colors flex items-center gap-2 p-1.5 cursor-pointer outline-none" 
              title="Mời Cafe"
            >
              <Coffee size={18} strokeWidth={1.2} />
              <span className="hidden sm:inline">Mời Cafe</span>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" sideOffset={12} className="w-64">
              <CoffeePopover />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger 
              className="hover:text-brand transition-colors flex items-center gap-2 p-1.5 cursor-pointer outline-none"
              title="Thông tin bảo mật"
            >
              <Info size={18} strokeWidth={1.2} />
              <span className="hidden sm:inline">Info</span>
            </PopoverTrigger>
            <PopoverContent side="bottom" align="end" sideOffset={12} className="w-80">
              <InfoPopover 
                onClearData={handleClearAllData} 
                connectionType={activeProfile?.useProxy === false ? 'direct' : 'proxy'} 
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Top Left Floating Menu */}
        <div ref={menuRef} className="absolute top-2 left-4 md:top-3 md:left-6 z-40 flex flex-col gap-4 w-[calc(100%-2rem)] md:w-80 pointer-events-none">
          {/* Logo & Agent Selector Row */}
          <div className="flex items-center gap-2 md:gap-4 pointer-events-auto w-max">
            <button
              onClick={() => {
                const nextView = headerView === 'agent' ? 'action' : 'agent';
                setHeaderView(nextView);
                setIsMenuOpen(nextView === 'action');
              }}
              className={cn(
                "w-10 h-10 flex items-center justify-center bg-surface hover:bg-surface-hover rounded-xl transition-all duration-300 flex-shrink-0 shadow-sm",
                headerView === 'action' && "bg-brand-light/20 rotate-90"
              )}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-colors", headerView === 'action' ? "text-brand" : "text-text")}>
                <path d="M4 16c4-8 12-8 16 0" />
              </svg>
            </button>

            {/* Conditional Header Content */}
            <AnimatePresence mode="wait">
              {headerView === 'agent' ? (
                <motion.div
                  key="agent-view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center"
                >
                  {config.profiles.length > 0 && (
                    <div className="flex items-center gap-2">
                      <DropdownMenu open={isAgentDropdownOpen} onOpenChange={setIsAgentDropdownOpen}>
                        <DropdownMenuTrigger
                          className="h-10 px-4 gap-2 border-none shadow-none focus:ring-0 bg-brand-light/20 hover:bg-brand-light/30 rounded-xl min-w-[120px] max-w-[200px] flex justify-between items-center font-medium group transition-all outline-none"
                        >
                          <span className="truncate">
                            {config.profiles.find(p => p.id === config.activeProfileId)?.name || "Select Agent"}
                          </span>
                          <ChevronDown size={14} strokeWidth={1.2} className={cn("opacity-50 transition-transform duration-300", isAgentDropdownOpen && "rotate-180")} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent 
                          align="start" 
                          sideOffset={4}
                          alignOffset={0}
                          className="w-[180px] bg-white border border-gray-100 shadow-sm rounded-xl p-0 z-[70] animate-in slide-in-from-top-1 duration-200"
                        >
                          {config.profiles.map(p => (
                            <DropdownMenuItem
                              key={p.id}
                              onClick={() => {
                                setConfig(prev => ({ ...prev, activeProfileId: p.id }));
                                setIsAgentDropdownOpen(false);
                              }}
                              className={cn(
                                "cursor-pointer px-4 py-2.5 text-xs transition-colors text-gray-600 first:rounded-t-xl last:rounded-b-xl",
                                (config.activeProfileId) === p.id 
                                  ? "bg-gray-50 font-medium text-black" 
                                  : "hover:bg-gray-50/50 hover:text-black"
                              )}
                            >
                              {p.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Tooltip>
                        <TooltipTrigger
                          onClick={() => handleNewChat()}
                          className="h-10 w-10 p-0 bg-brand-light/20 hover:bg-brand-light/30 text-brand border-none shadow-none rounded-xl flex-shrink-0 flex items-center justify-center outline-none cursor-pointer"
                        >
                          <Plus size={18} strokeWidth={1.2} />
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={10}>
                          Tạo chat mới
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="action-view"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Button
                    className="h-10 px-4 gap-2 bg-brand-light/30 hover:bg-brand-light/50 text-brand border-none shadow-none rounded-xl font-medium"
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setHeaderView('agent');
                    }}
                  >
                    <Plus size={18} strokeWidth={1.2} />
                    <span>New Agent</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} strokeWidth={1.2} />
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
                            <Trash2 size={16} strokeWidth={1.2} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content */}
        <main className="flex-grow flex flex-col relative h-full overflow-hidden bg-transparent">
          {/* Messages Area */}
          <div 
            ref={scrollAreaRef}
            onScroll={handleScroll}
            className="flex-grow overflow-y-auto pt-16 md:pt-20"
          >
            {currentSession?.messages.length === 0 ? (
              <div className="min-h-full flex flex-col">
                <div className="min-h-[70vh] flex flex-col items-center justify-start pt-[15vh] text-center px-4 relative flex-shrink-0 pb-12">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <h1 className="text-4xl md:text-6xl font-serif italic text-text/90 font-light tracking-tight">
                      Chat IU
                    </h1>
                    <p className="text-text-muted text-lg md:text-xl font-light max-w-md mx-auto">
                      Kết nối Agent từ webhook của bạn và bắt đầu trò chuyện.
                    </p>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    onClick={() => {
                      scrollAreaRef.current?.scrollTo({
                        top: window.innerHeight,
                        behavior: 'smooth'
                      });
                    }}
                    className="mt-32 flex flex-col items-center gap-4 text-text-muted hover:text-text transition-all cursor-pointer group"
                  >
                    <span className="text-[9px] uppercase tracking-[0.4em] font-medium opacity-40 group-hover:opacity-100 transition-opacity duration-500">Hướng dẫn kết nối</span>
                    <motion.div
                      animate={{ y: [0, 8, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                      <ChevronDown size={24} strokeWidth={1} />
                    </motion.div>
                  </motion.button>
                </div>

                <div id="config-guide">
                  <ConfigGuide />
                </div>
              </div>
            ) : (
              <div className="flex flex-col max-w-5xl w-full mx-auto pb-48 px-4 md:px-12">
                <div className="px-2 md:px-4">
                  <AnimatePresence initial={false}>
                    {currentSession?.messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChatMessage 
                          message={message} 
                          agentName={config.profiles.find(p => p.id === (currentSession?.profileId || config.activeProfileId))?.name}
                        />
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-6 px-4"
                      >
                        <div className="flex gap-2 items-end h-8">
                          {[0, 1, 2].map((i) => {
                            const heights = [-20, -35, -15];
                            const delays = [0, 0.15, 0.3];
                            const durations = [0.7, 0.85, 0.6];
                            return (
                              <motion.div
                                key={i}
                                animate={{ 
                                  y: [0, heights[i], 0],
                                  opacity: [0.4, 1, 0.4] 
                                }}
                                transition={{ 
                                  repeat: Infinity, 
                                  duration: durations[i], 
                                  delay: delays[i],
                                  ease: "easeInOut"
                                }}
                                className="w-2 h-2 rounded-full bg-brand"
                              />
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} className="h-4" />
                </div>
              </div>
            )}
          </div>

          {/* Scroll to Bottom Button */}
          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                onClick={scrollToBottom}
                className="absolute bottom-32 right-8 md:right-12 p-3 bg-surface hover:bg-surface-hover border border-border shadow-lg rounded-full text-text-muted hover:text-text transition-all z-30"
              >
                <ChevronDown size={20} strokeWidth={1.2} />
              </motion.button>
            )}
          </AnimatePresence>

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
      </div>
    </TooltipProvider>
  );
}




