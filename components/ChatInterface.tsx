import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Button } from './ui/Button';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, currentUserId, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white shadow-premium rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-xl -z-10"></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">💬</div>
            <p className="text-sm font-medium">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex items-end gap-3 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`max-w-[75%] md:max-w-md lg:max-w-lg px-5 py-3 shadow-sm ${msg.senderId === currentUserId ? 'bg-primary text-white rounded-2xl rounded-br-sm' : 'bg-teal-50 text-slate-800 rounded-2xl rounded-bl-sm border-none'}`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <div className={`mt-2 flex items-center gap-1.5 ${msg.senderId === currentUserId ? 'justify-end text-teal-100' : 'justify-start text-slate-400'}`}>
                  <span className="text-[10px] font-medium tracking-wide">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.senderId === currentUserId && <span className="text-[10px]">✓✓</span>}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white/80 border-t border-slate-100/50 flex items-center gap-3 backdrop-blur-md">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 block w-full rounded-xl border-slate-200 shadow-sm sm:text-sm bg-slate-50 hover:bg-white focus:bg-white focus:border-primary focus:ring-primary transition-colors py-3 px-4"
        />
        <Button type="submit" className="rounded-xl px-6 py-3 shadow-md bg-gradient-to-r from-primary to-teal-600 hover:from-primary hover:to-teal-700 hover:shadow-lg transition-all border-none font-bold tracking-wide">
          Send <span className="ml-2">↗</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;