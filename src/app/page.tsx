'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { category: string; question: string; similarity: number }[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (userMessage: string) => {
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content:
          'I apologize, but I encountered an error processing your question. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex-none px-6 py-4 border-b border-saffron-200 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-400 to-sacred-500 flex items-center justify-center text-white text-lg">
            🙏
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Sadhana Guide
            </h1>
            <p className="text-sm text-gray-500">
              Ask questions about spiritual practices & sadhana
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-saffron-300 to-sacred-400 flex items-center justify-center text-3xl mb-6 shadow-lg">
              🙏
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Namaste 🙏
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              I&apos;m here to help answer your questions about spiritual
              sadhana practices. Ask me about nitya upasana, japa, deity
              worship, vishesh sadhanas, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              {[
                'How should I set up my daily sadhana routine?',
                'What is the correct way to do japa?',
                'Can I do sadhana during travel?',
                'How to choose a deity for worship?',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-4 py-3 text-sm text-left rounded-xl border border-saffron-200 
                           bg-white/80 hover:bg-saffron-50 hover:border-saffron-300 
                           transition-all duration-200 text-gray-600 hover:text-gray-800"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 message-enter">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-400 to-sacred-500 flex items-center justify-center text-white text-sm flex-shrink-0">
              🙏
            </div>
            <div className="bg-white/80 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-saffron-400 typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-saffron-400 typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-saffron-400 typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </main>
  );
}
