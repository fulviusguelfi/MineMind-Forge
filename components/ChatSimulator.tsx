
import React, { useState, useRef, useEffect } from 'react';
import { BotConfig, ChatMessage, AppLanguage } from '../types';
import { simulateAIChat } from '../services/geminiService';
import { UI_TEXT } from '../constants';
import { Send, Bot, User, RefreshCw, Trash2, Clock } from 'lucide-react';

interface ChatSimulatorProps {
  config: BotConfig;
  language: AppLanguage;
}

const ChatSimulator: React.FC<ChatSimulatorProps> = ({ config, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `System: AI Core ${config.name} initialized. Archetype: ${config.behavior}. Waiting for input...`, timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = UI_TEXT[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const responseText = await simulateAIChat(config, messages, inputValue);
      const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       setMessages(prev => [...prev, { role: 'model', text: "[Error: Connection Terminated]", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{ role: 'model', text: `System reset. ${config.name} memory cleared.`, timestamp: Date.now() }]);
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse absolute -right-0.5 -bottom-0.5 border border-gray-900"></div>
             <Bot className="w-6 h-6 text-gray-300" />
          </div>
          <div>
            <h3 className="font-bold text-gray-100 text-sm">{config.name}</h3>
            <span className="text-xs text-green-400 font-mono tracking-wider uppercase">{config.behavior}</span>
          </div>
        </div>
        <button onClick={handleClear} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-gray-800 rounded-lg" title={t.reset}>
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-5 bg-[#111827] custom-scrollbar">
        {messages.map((msg, idx) => {
          const isModel = msg.role === 'model';
          return (
            <div key={idx} className={`flex gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
              
              <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-1 border shadow-sm ${
                isModel 
                  ? 'bg-gray-800 border-gray-700 text-green-400' 
                  : 'bg-blue-900/30 border-blue-800 text-blue-400'
              }`}>
                {isModel ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>

              <div className={`flex flex-col max-w-[80%] ${isModel ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-xs font-bold ${isModel ? 'text-green-500' : 'text-blue-500'}`}>
                    {isModel ? config.name : 'Creator'}
                  </span>
                  <span className="text-[10px] text-gray-600">{formatTime(msg.timestamp)}</span>
                </div>
                
                <div className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm font-medium ${
                  isModel 
                    ? 'bg-gray-800 text-gray-200 rounded-r-xl rounded-bl-xl border border-gray-700' 
                    : 'bg-blue-600 text-white rounded-l-xl rounded-br-xl shadow-blue-900/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-green-400">
               <Bot className="w-5 h-5" />
             </div>
             <div className="bg-gray-800 px-4 py-3 rounded-r-xl rounded-bl-xl border border-gray-700 flex items-center gap-1.5 w-16">
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`${t.inputPlaceholder} ${config.name}...`}
            disabled={isLoading}
            className="w-full bg-[#1f2937] border border-gray-700 text-gray-200 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-500 text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 disabled:hover:bg-green-600 transition-all shadow-lg shadow-green-900/20"
            title={t.send}
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-gray-600 font-mono">
              Use <span className="text-gray-400">!help</span> or <span className="text-gray-400">!identify</span> to test commands.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ChatSimulator;
