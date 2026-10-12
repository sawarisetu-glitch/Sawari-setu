import React from 'react';
import { Bell, CheckCheck, X, Sparkles, ShieldCheck, Tag, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'offer':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'safety':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'booking':
        return <Sparkles className="w-4 h-4 text-[#FF8C00]" />;
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF8C00] p-2 flex items-center justify-center text-black font-black">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">सूचनाएं एवं अलर्ट (Notifications)</h3>
              <p className="text-[11px] text-zinc-400">सवारी अपडेट, ऑफर्स व सुरक्षा संदेश</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mark all read ribbon */}
        <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>कुल सूचनाएं: {notifications.length}</span>
          <button
            onClick={onMarkAllRead}
            className="text-[#FF8C00] hover:underline font-bold flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>सभी को पढ़ा हुआ मार्क करें</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-2xl border transition-all flex items-start gap-3 ${
                notif.read
                  ? 'bg-zinc-900/50 border-zinc-800/80 text-zinc-400'
                  : 'bg-zinc-900 border-amber-500/30 text-zinc-200 ring-1 ring-amber-500/20'
              }`}
            >
              <div className="p-2 rounded-xl bg-black/60 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs">{notif.title}</h4>
                  <span className="text-[10px] text-zinc-500">{notif.time}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
