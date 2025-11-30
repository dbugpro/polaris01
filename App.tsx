import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles } from 'lucide-react';
import Orb from './components/Orb';
import ChatMessage from './components/ChatMessage';
import { Message, Sender, OrbState } from './types';
import { sendMessageStream, initializeChat } from './services/gemini';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [orbState, setOrbState] = useState<OrbState>(OrbState.Idle);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
    // Welcome message
    const welcomeMsg: Message = {
      id: 'welcome',
      text: "Systems online. I am Polaris. How may I assist you today?",
      sender: Sender.Bot,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    setInputText('');
    setIsLoading(true);
    setOrbState(OrbState.Thinking);

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      sender: Sender.User,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);

    // Create placeholder for bot message
    const botMsgId = (Date.now() + 1).toString();
    const botMsgPlaceholder: Message = {
      id: botMsgId,
      text: '',
      sender: Sender.Bot,
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, botMsgPlaceholder]);

    try {
      const stream = sendMessageStream(userMessageText);
      let fullResponse = '';
      
      setOrbState(OrbState.Speaking);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMsgId 
              ? { ...msg, text: fullResponse } 
              : msg
          )
        );
      }

      setMessages(prev => 
        prev.map(msg => 
          msg.id === botMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to stream response", error);
    } finally {
      setIsLoading(false);
      setOrbState(OrbState.Idle);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [inputText, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden relative selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
          <h1 className="text-xl font-semibold tracking-wide text-slate-100">Polaris 0.1</h1>
        </div>
        <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
          <Sparkles size={12} /> GEMINI-2.5-FLASH
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden">
        
        {/* Left/Top Panel: The Orb Visualization */}
        <div className="w-full md:w-1/2 h-[40vh] md:h-full flex items-center justify-center relative">
          <Orb state={orbState} />
          
          {/* Status Text under Orb */}
          <div className="absolute bottom-8 text-center w-full opacity-60 font-mono text-xs tracking-[0.2em] text-blue-300">
            {orbState === OrbState.Idle && "SYSTEM ONLINE"}
            {orbState === OrbState.Thinking && "PROCESSING DATA..."}
            {orbState === OrbState.Speaking && "TRANSMITTING..."}
            {orbState === OrbState.Listening && "AWAITING INPUT..."}
          </div>
        </div>

        {/* Right/Bottom Panel: Chat Interface */}
        <div className="w-full md:w-1/2 h-[60vh] md:h-full flex flex-col bg-slate-900/80 backdrop-blur-sm border-t md:border-t-0 md:border-l border-slate-800">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-slate-800 bg-slate-900/90">
            <div className="relative flex items-center gap-3 max-w-2xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Polaris..."
                disabled={isLoading}
                onFocus={() => { if(orbState === OrbState.Idle) setOrbState(OrbState.Listening) }}
                onBlur={() => { if(orbState === OrbState.Listening) setOrbState(OrbState.Idle) }}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 text-sm md:text-base rounded-full py-3 md:py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-slate-600 font-mono">
                  AI generates responses. Check for accuracy.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;