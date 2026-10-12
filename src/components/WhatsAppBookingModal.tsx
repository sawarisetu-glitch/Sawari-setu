import React, { useState } from 'react';
import {
  MessageCircle,
  X,
  ExternalLink,
  Send,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { RideMode, RideBooking } from '../types';

interface WhatsAppBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    passengerName: string;
    passengerPhone: string;
    pickup: string;
    destination: string;
    mode: RideMode;
    modeTitle: string;
    distanceKm: number;
    totalFare: number;
    isScheduled?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    isOutstation?: boolean;
    isReturnTripDiscount?: boolean;
  };
}

export const WhatsAppBookingModal: React.FC<WhatsAppBookingModalProps> = ({
  isOpen,
  onClose,
  bookingDetails,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct_send' | 'bot_simulator'>('direct_send');

  if (!isOpen) return null;

  // Format professional structured WhatsApp Order Message
  const formatWhatsAppMessage = () => {
    const timing = bookingDetails.isScheduled
      ? `📅 पूर्व-निर्धारित: ${bookingDetails.scheduledDate || 'आज'} समय: ${bookingDetails.scheduledTime || 'शीघ्र'}`
      : '⚡ अभी तत्काल रवानगी (Immediate Ride)';

    const outstationTag = bookingDetails.isOutstation ? '🛣️ आउटस्टेशन ट्रिप' : '🏙️ लोकल शहर';
    const returnTag = bookingDetails.isReturnTripDiscount ? ' (🔄 वापसी ट्रिप 40% छूट लागू)' : '';

    return `*🚖 सवारी सेतु (Savari Setu) - डायरेक्ट बुकिंग अनुरोध*

👤 *यात्री का नाम:* ${bookingDetails.passengerName || 'यात्री'}
📞 *मोबाइल नंबर:* ${bookingDetails.passengerPhone || '9450985355'}
📍 *पिकअप:* ${bookingDetails.pickup}
🎯 *गंतव्य:* ${bookingDetails.destination}
🚗 *वाहन प्रकार:* ${bookingDetails.modeTitle}
🛣️ *अनुमानित दूरी:* ${bookingDetails.distanceKm} किमी [${outstationTag}]
⏱️ *सवारी का समय:* ${timing}
💰 *कुल अनुमानित किराया:* ₹${bookingDetails.totalFare} (टोल टैक्स रूट में शामिल)${returnTag}

_नोट: कृपया निकटतम सत्यापित ड्राइवर साथी को तुरंत असाइन करें।_
- सवारी सेतु हेल्पडेस्क: 9450985355`;
  };

  const messageText = formatWhatsAppMessage();
  const whatsappUrl = `https://wa.me/919450985355?text=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/50 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>व्हाट्सएप डायरेक्ट बॉट (WhatsApp Bot)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  24×7 एक्टिव
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                1-क्लिक में आधिकारिक व्हाट्सएप पर सवारी व माल बुक करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-2 bg-zinc-900 border-b border-zinc-800 text-xs font-bold gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('direct_send')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'direct_send'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>व्हाट्सएप पर भेजें (1-Click)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bot_simulator')}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bot_simulator'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>लाइव बॉट चैट सिम्युलेटर</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeTab === 'direct_send' ? (
            <>
              {/* WhatsApp Message Preview */}
              <div className="p-4 rounded-2xl bg-[#0b141a] border border-[#202c33] text-zinc-200 font-sans space-y-2 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-[#202c33] text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    सवारी सेतु आधिकारिक बॉट संदेश
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">+91 9450985355</span>
                </div>

                <div className="whitespace-pre-line text-xs bg-[#1f2c34] p-3 rounded-2xl border border-[#2a3942] text-zinc-100 leading-relaxed font-mono">
                  {messageText}
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                  <span>टोल टैक्स रूट में शामिल • 0% हिडन चार्ज</span>
                  <span className="text-emerald-400 font-bold">✓ रेडी टू सेंड</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 active:scale-98 transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-black" />
                  <span>व्हाट्सएप खोलें और बुक करें (Open WhatsApp)</span>
                  <ExternalLink className="w-4 h-4 text-black" />
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-800"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'टेक्स्ट कॉपी हो गया!' : 'मेसेज टेक्स्ट कॉपी करें'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Bot Conversation Simulator */
            <div className="space-y-3 font-sans">
              <div className="p-3 bg-[#0b141a] rounded-2xl border border-[#202c33] space-y-2.5">
                {/* Bot Message 1 */}
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-black font-bold shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="p-2.5 rounded-2xl rounded-tl-none bg-[#202c33] text-zinc-100 text-[11px] leading-snug">
                    नमस्ते! 🙏 <strong>सवारी सेतु</strong> ऑटोमेटेड बुकिंग बॉट में आपका स्वागत है। आप कहाँ से कहाँ जाना चाहते हैं?
                  </div>
                </div>

                {/* User Message */}
                <div className="flex items-start gap-2 max-w-[85%] ml-auto justify-end">
                  <div className="p-2.5 rounded-2xl rounded-tr-none bg-[#005c4b] text-white text-[11px] leading-snug">
                    {bookingDetails.pickup} से {bookingDetails.destination} तक {bookingDetails.modeTitle} चाहिए।
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold shrink-0 mt-0.5">
                    <User className="w-4 h-4 text-black" />
                  </div>
                </div>

                {/* Bot Message 2 */}
                <div className="flex items-start gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-black font-bold shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div className="p-2.5 rounded-2xl rounded-tl-none bg-[#202c33] text-zinc-100 text-[11px] leading-snug space-y-1">
                    <p>✅ <strong>रूट मिल गया!</strong> दूरी: {bookingDetails.distanceKm} किमी</p>
                    <p>💰 <strong>कुल किराया: ₹{bookingDetails.totalFare}</strong> (टोल टैक्स रूट में शामिल, ₹0 अलग से)</p>
                    <p className="text-emerald-400 font-bold">निकटतम ड्राइवर साथी को अलर्ट भेजा गया है!</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <span>असली व्हाट्सएप चैट शुरू करें (+91 9450985355)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
