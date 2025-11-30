import React from 'react';
import { Message, Sender } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-blue-600'} shadow-lg`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div 
          className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-md backdrop-blur-sm
            ${isUser 
              ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none' 
              : 'bg-slate-800/60 border border-slate-700/50 text-slate-200 rounded-tl-none'
            }
          `}
        >
          {/* Simple markdown parser for bold and code blocks */}
          <div className="whitespace-pre-wrap font-light">
             {message.text.split('```').map((part, index) => {
                if (index % 2 === 1) {
                  return <code key={index} className="block bg-black/30 p-2 rounded my-2 font-mono text-xs">{part}</code>
                }
                return part.split('**').map((subPart, subIndex) => 
                  subIndex % 2 === 1 ? <strong key={`${index}-${subIndex}`} className="font-bold text-white">{subPart}</strong> : subPart
                );
             })}
          </div>
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;