
import React, { useState, useRef, useEffect } from 'react';
import { AppData, ChatMessage } from '../types';
import { askAssistant } from '../services/geminiService';

interface Props {
  data: AppData;
}

const ChatInterface: React.FC<Props> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Olá! Sou seu Assistente Pro. Analisei seus dados de ${data.profile.city_name}. Como posso te ajudar a lucrar mais hoje?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const response = await askAssistant(userMessage, data);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-emerald-500 rounded-full shadow-2xl shadow-emerald-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
        >
          <svg className="w-8 h-8 text-slate-950 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          {/* Header */}
          <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">A</div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-tighter">Assistente Pro</h3>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online • IA de Análise</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-slate-950/20">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-800/30 border-t border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Pergunte sobre seus ganhos..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 pr-14 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
            <p className="text-[8px] text-slate-600 text-center mt-3 uppercase font-black tracking-[0.2em]">Respostas baseadas em seus dados reais</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
