'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-none px-4 py-4 border-t border-saffron-200 bg-white/60 backdrop-blur-sm"
    >
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about sadhana practices..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none rounded-2xl border border-saffron-200 bg-white 
                     px-4 py-3 text-sm text-gray-800 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-saffron-300 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-saffron-400 to-sacred-500 
                   text-white flex items-center justify-center
                   hover:from-saffron-500 hover:to-sacred-600 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <p className="text-center text-[11px] text-gray-400 mt-2">
        Answers are based solely on curated sadhana teachings. For personalized
        guidance, consult your guru.
      </p>
    </form>
  );
}
