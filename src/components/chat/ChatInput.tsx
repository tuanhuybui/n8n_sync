import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (!isLoading && !disabled) {
      textareaRef.current?.focus();
    }
  }, [isLoading, disabled]);

  return (
    <div className="w-full px-2 md:px-4 pb-4 md:pb-8">
      <div className="relative flex items-end bg-transparent p-1 md:p-2">
        <TextareaAutosize
          ref={textareaRef}
          rows={1}
          maxRows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập ý tưởng của bạn..."
          className="flex-grow bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-text placeholder-gray-300 py-2 md:py-3 px-3 md:px-4 resize-none text-xl md:text-3xl font-serif italic font-light"
          disabled={disabled || isLoading}
          style={{ caretColor: '#000', boxShadow: 'none' }}
        />

        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading || disabled}
          className={cn(
            "h-10 w-10 md:h-12 md:w-12 rounded-full p-0 transition-all duration-200 flex-shrink-0 mb-1 md:mb-2 shadow-sm border border-border",
            input.trim() 
              ? "bg-text hover:bg-text/80 text-white border-transparent" 
              : "bg-surface text-text-muted hover:bg-surface-hover"
          )}
          variant="ghost"
        >
          <ArrowUp size={20} className={cn(isLoading && "animate-pulse")} />
        </Button>
      </div>
    </div>
  );
};


