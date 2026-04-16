import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css'; // Changed to light theme highlight
import { Message } from '../../types';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface ChatMessageProps {
  message: Message;
  agentName?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, agentName = 'Agent' }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("py-3 md:py-4 px-2 md:px-0 group", isUser && "flex flex-col items-end")}>
      <div className={cn("flex flex-col gap-1", isUser ? "items-end max-w-[90%] md:max-w-[80%]" : "w-full mx-auto")}>
        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-semibold text-text">
            {isUser ? 'You' : agentName}
          </span>
        </div>

        <div className={cn(
          "prose-custom",
          isUser ? "bg-brand-light/20 p-3 md:p-4 rounded-2xl rounded-tr-none text-right inline-block" : "w-full"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
            components={{
              pre: ({ node, ...props }) => (
                <div className="relative group/code my-4">
                  <div className="flex items-center justify-between px-4 py-2 bg-surface-hover rounded-t-xl border-b border-border">
                    <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">Code</span>
                    <button
                      onClick={() => {
                        const code = (props.children as any)?.props?.children;
                        if (code) copyToClipboard(code);
                      }}
                      className="p-1 hover:text-text text-text-muted transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <pre {...props} className="m-0 p-4 overflow-x-auto scrollbar-thin bg-surface" />
                </div>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-text-muted hover:text-text hover:bg-surface-hover transition-all"
              onClick={() => copyToClipboard(message.content)}
            >
              {copied ? <Check size={12} className="mr-1" /> : <Copy size={12} className="mr-1" />}
              <span className="text-xs font-medium">Copy</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

