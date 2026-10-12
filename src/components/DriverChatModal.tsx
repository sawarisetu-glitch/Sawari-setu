import React, { useState } from 'react';
import { MessageSquare, Send, X, PhoneCall, CheckCheck } from 'lucide-react';
import { DriverChatMessage } from '../types';

interface DriverChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
}

export const DriverChatModal: React.FC<DriverChatModalProps> = ({
  isOpen,
  onClose,
  driverName,
  driverPhone,
  vehicleNumber,
}) => {
  const [messages, setMessages] = useState<DriverChatMessage[]>([
    {
      id: 'm1',
      sender: 'driver',
      text: `नमस्ते! मैं ${driverName} (${vehicleNumber})। मैं आपकी पिकअप लोकेशन की ओर आ रहा हूँ।`,
      time: '2 मिनट पहले',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const quickMessages = [
    'मैं पिकअप पॉइंट पर खड़ा हूँ।',
    'कृपया जल्दी आएं।',
    'मैं मुख्य गेट के पास हूँ।',
    'पहुंचने में कितना समय लगेगा?',
  ];

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg: DriverChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'passenger',
      text,
      time: 'अभी',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Simulated quick driver reply
    setTimeout(() => {
      const driverReplies = [
        'जी, मैं 2 मिनट में पहुंच रहा हूँ।',
        'ठीक है, मैंने आपकी लोकेशन देख ली है।',
        'मैं पहुंच गया हूँ, इंडिकेटर ऑन है।',
      ];
      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      setMessages((prev) => [
        ...prev,
        {
          id: `d_${Date.now()}`,
          sender: 'driver',
          text: randomReply,
          time: 'अभी',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-[#FF8C00] font-black flex items-center justify-center border border-amber-500/30">
              {driverName[0] || 'D'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                {driverName}
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">{vehicleNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${driverPhone}`}
              className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40"
              title="कॉल करें"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
          {messages.map((msg) => {
            const isMe = msg.sender === 'passenger';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-2.5 shadow-md ${
                    isMe
                      ? 'bg-[#FF8C00] text-black font-medium rounded-tr-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span
                    className={`block text-[9px] mt-1 ${
                      isMe ? 'text-black/60 text-right' : 'text-zinc-500'
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick message suggestions */}
        <div className="p-2 bg-zinc-900/50 border-t border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickMessages.map((qm, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qm)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-300 shrink-0"
            >
              💬 {qm}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ड्राइवर को संदेश भेजें..."
              className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#FF8C00] text-black font-bold shadow-md hover:bg-orange-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
