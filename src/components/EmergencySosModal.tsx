import React, { useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  X,
  MessageCircle,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { openWhatsAppHelpline } from '../utils/storage';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName?: string;
  userPhone?: string;
}

export const EmergencySosModal: React.FC<EmergencySosModalProps> = ({
  isOpen,
  onClose,
  currentLocationName = 'हजरतगंज, लखनऊ (GPS Tracked)',
  userPhone = '9450985355',
}) => {
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const handleSendDistressSignal = () => {
    setSosSent(true);
    setTimeout(() => {
      // open whatsapp emergency alert
      openWhatsAppHelpline(
        `[URGENT SOS] आपातकालीन सहायता की आवश्यकता है! लोकेशन: ${currentLocationName}. फोन: ${userPhone}`
      );
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border-2 border-red-600/80 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.5)] overflow-hidden p-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Flashing SOS Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 p-2.5 flex items-center justify-center text-white shadow-lg shadow-red-600/50 animate-bounce">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>आपातकालीन सहायता</span>
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                SOS 24x7
              </span>
            </h2>
            <p className="text-xs text-red-400">सवारी सेतु सुरक्षा कंट्रोल रूम व पुलिस सहायता</p>
          </div>
        </div>

        {/* Current Location Badge */}
        <div className="p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800 mb-4 flex items-center gap-2.5 text-xs">
          <MapPin className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <span className="text-zinc-500 block text-[10px]">आपकी वर्तमान GPS लोकेशन:</span>
            <span className="text-zinc-200 font-semibold">{currentLocationName}</span>
          </div>
        </div>

        {/* Big Alert Button */}
        <div className="mb-4">
          <button
            onClick={handleSendDistressSignal}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${
              sosSent
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/40 active:scale-95'
            }`}
          >
            {sosSent ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>कंट्रोल रूम को अलर्ट भेजा गया!</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>तत्काल कंट्रोल रूम अलर्ट भेजें (DISTRESS SIGNAL)</span>
              </>
            )}
          </button>
        </div>

        {/* Direct Call Cards */}
        <div className="space-y-2">
          {/* Police 112 */}
          <a
            href="tel:112"
            className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                112
              </div>
              <div>
                <span className="font-bold text-white block">पुलिस सहायता (Police Helpline)</span>
                <span className="text-[11px] text-zinc-400">राष्ट्रीय आपातकालीन नंबर 112</span>
              </div>
            </div>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </a>

          {/* Ambulance 108 */}
          <a
            href="tel:108"
            className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-bold">
                108
              </div>
              <div>
                <span className="font-bold text-white block">एम्बुलेंस सेवा (Medical Ambulance)</span>
                <span className="text-[11px] text-zinc-400">तत्काल चिकित्सा सहायता 108</span>
              </div>
            </div>
            <PhoneCall className="w-4 h-4 text-red-400" />
          </a>

          {/* Sawari Setu Official Control Room */}
          <a
            href="tel:9450985355"
            className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 transition-all text-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF8C00] text-black flex items-center justify-center font-bold">
                ★
              </div>
              <div>
                <span className="font-bold text-amber-300 block">
                  सवारी सेतु 24x7 कंट्रोल रूम
                </span>
                <span className="text-[11px] text-zinc-400">+91 9450985355 (Helpline)</span>
              </div>
            </div>
            <PhoneCall className="w-4 h-4 text-[#FF8C00]" />
          </a>
        </div>

        {/* WhatsApp Share Button */}
        <div className="mt-3">
          <button
            onClick={() =>
              openWhatsAppHelpline(
                `[SOS ALERT] मैं सवारी सेतु यात्रा पर हूँ। मेरी लाइव लोकेशन: ${currentLocationName}। सहायता हेतु कॉल करें: ${userPhone}`
              )
            }
            className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>व्हाट्सएप पर परिजनों को लाइव लोकेशन भेजें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
