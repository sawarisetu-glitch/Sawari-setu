import React, { useState } from 'react';
import {
  HelpCircle,
  PhoneCall,
  MessageCircle,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SupportTicket } from '../types';
import { openWhatsAppHelpline } from '../utils/storage';
import { Logo } from './Logo';

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportCenterModal: React.FC<SupportCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: 'TKT-SS-9041',
      category: 'lost_item',
      subject: 'ऑटो में पानी की बोतल व बैग छूट गया था',
      description: 'UP32-BT-7812 में पीछे की सीट पर भूरा बैग।',
      status: 'resolved',
      createdAt: '05 मार्च 2026',
    },
  ]);

  const [category, setCategory] = useState<SupportTicket['category']>('lost_item');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [successCreated, setSuccessCreated] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    const newTicket: SupportTicket = {
      id: `TKT-SS-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      subject,
      description,
      status: 'investigating',
      createdAt: new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    setTickets([newTicket, ...tickets]);
    setSuccessCreated(newTicket.id);
    setSubject('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header with Official Logo */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <Logo size="sm" showTagline={true} />
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Contact Ribbon */}
        <div className="p-3 bg-zinc-900/90 border-b border-zinc-800 grid grid-cols-2 gap-2 text-xs">
          <a
            href="tel:9450985355"
            className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <PhoneCall className="w-4 h-4 text-[#FF8C00]" />
            <span>कॉल: 9450985355</span>
          </a>

          <button
            onClick={() => openWhatsAppHelpline('नमस्ते सहायता केंद्र! मुझे अपनी पिछली ट्रिप में सहायता चाहिए।')}
            className="p-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>व्हाट्सएप लाइव चैट</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {successCreated && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>शिकायत दर्ज हुई! टिकट आईडी: {successCreated}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                हमारी कस्टमर सेफ्टी टीम 15 मिनट के भीतर आपसे संपर्क करेगी।
              </p>
            </div>
          )}

          {/* New Ticket Form */}
          <form onSubmit={handleSubmitTicket} className="space-y-3 p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800">
            <h4 className="font-bold text-white text-xs">नई शिकायत या खोया-पाया दर्ज करें:</h4>

            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">समस्या का प्रकार:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
              >
                <option value="lost_item">🎒 गाड़ी में सामान छूट गया (Lost Item)</option>
                <option value="fare_issue">💵 अधिक किराया / बिल संबंधी समस्या (Fare Dispute)</option>
                <option value="driver_conduct">🚗 ड्राइवर का व्यवहार या सुरक्षा शिकायत (Driver Conduct)</option>
                <option value="insurance_claim">🛡️ पारगमन बीमा क्लेम (Transit Insurance Claim)</option>
                <option value="other">📌 अन्य समस्या (Other Query)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">विषय (Subject):</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="संक्षिप्त विवरण दें"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">विस्तृत जानकारी:</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="गाड़ी नंबर, खोया सामान या समस्या का पूरा ब्यौरा लिखें..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-98"
            >
              टिकट सबमिट करें
            </button>
          </form>

          {/* Active Tickets List */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
              आपकी हालिया शिकायतें (Support Tickets)
            </h4>

            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-400">{t.id}</span>
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                      t.status === 'resolved'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {t.status === 'resolved' ? '✓ हल हो गया (Resolved)' : '⏳ जांच जारी'}
                  </span>
                </div>
                <h5 className="font-bold text-white">{t.subject}</h5>
                <p className="text-zinc-400 text-[11px]">{t.description}</p>
                <span className="text-[10px] text-zinc-500 block">दर्ज दिनांक: {t.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
