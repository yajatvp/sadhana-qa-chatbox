'use client';

import { useState } from 'react';

interface Source {
  category: string;
  question: string;
  similarity: number;
}

interface MessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
  };
}

export default function ChatMessage({ message }: MessageProps) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 message-enter ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
            : 'bg-gradient-to-br from-saffron-400 to-sacred-500 text-white'
        }`}
      >
        {isUser ? '👤' : '🙏'}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'bg-blue-500 text-white rounded-2xl rounded-tr-md'
            : 'bg-white/80 text-gray-800 rounded-2xl rounded-tl-md border border-saffron-100'
        } px-4 py-3 shadow-sm`}
      >
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>

        {/* Sources toggle */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-saffron-100">
            <button
              onClick={() => setShowSources(!showSources)}
              className="text-xs text-saffron-600 hover:text-saffron-800 font-medium flex items-center gap-1"
            >
              <svg
                className={`w-3 h-3 transition-transform ${
                  showSources ? 'rotate-90' : ''
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {showSources ? 'Hide' : 'View'} sources ({message.sources.length}
              )
            </button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {message.sources.map((source, i) => (
                  <div
                    key={i}
                    className="text-xs bg-saffron-50 rounded-lg p-2 border border-saffron-100"
                  >
                    <span className="font-medium text-saffron-700">
                      {source.category}
                    </span>
                    <p className="text-gray-600 mt-0.5 line-clamp-2">
                      &ldquo;{source.question}&rdquo;
                    </p>
                    <span className="text-saffron-500 text-[10px]">
                      {(source.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
