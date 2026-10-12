import React from 'react';
import {
  Sparkles,
  Menu,
  PhoneCall,
  ShieldAlert,
  User,
  MessageCircle,
  Share2,
  Download,
  Receipt,
  Mic,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile } from '../types';
import { openWhatsAppHelpline } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  user: UserProfile | null;
  onOpenAiAssistant: () => void;
  onOpenHamburger: () => void;
  onOpenSos: () => void;
  onOpenAuth: () => void;
  onOpenDownload?: () => void;
  onOpenShare?: () => void;
  onOpenTripHistory?: () => void;
  onOpenProfile?: () => void;
  onOpenVoiceBooking?: () => void;
  onSwitchToWebsiteMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAiAssistant,
  onOpenHamburger,
  onOpenSos,
  onOpenAuth,
  onOpenDownload,
  onOpenShare,
  onOpenTripHistory,
  onOpenProfile,
  onOpenVoiceBooking,
  onSwitchToWebsiteMode,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#121212]/95 backdrop-blur-md border-b border-zinc-800 shadow-md">
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Company Logo & Brand Name */}
        <div className="flex items-center gap-2 shrink-0">
          <Logo size="sm" showTagline={true} inline />
        </div>

        {/* Essential Quick Actions (SOS, Download, Theme, AI, User, Menu) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Switch to Full Website Mode Button */}
          {onSwitchToWebsiteMode && (
            <button
              onClick={onSwitchToWebsiteMode}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="वेबसाइट मोड में देखें (Switch to Website Portal)"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span className="font-extrabold text-[11px] hidden xs:inline">वेबसाइट</span>
            </button>
          )}

          {/* Quick SOS Red Emergency Button */}
          <button
            onClick={onOpenSos}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 animate-pulse cursor-pointer"
            title="आपातकालीन सहायता (Emergency SOS 112/108)"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="font-extrabold text-[11px]">SOS</span>
          </button>

          {/* Quick Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-amber-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm"
            title={theme === 'dark' ? 'लाइट मोड में बदलें (Switch to Light Theme)' : 'डार्क मोड में बदलें (Switch to Dark Theme)'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-zinc-700" />
            )}
          </button>

          {/* Direct App Download Button (📲) */}
          {onOpenDownload && (
            <button
              onClick={onOpenDownload}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="सवारी सेतु ऐप डाउनलोड करें (Install PWA / Android APK)"
            >
              <Download className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span className="text-[11px] font-black">ऐप डाउनलोड</span>
            </button>
          )}

          {/* Quick AI Assistant Button (✨) */}
          <button
            onClick={onOpenAiAssistant}
            className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-amber-300 border border-zinc-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            title="सवारी सेतु AI साथी"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span className="text-[11px] font-bold">AI साथी</span>
          </button>

          {/* User profile / login button */}
          {user ? (
            <button
              onClick={() => {
                if (onOpenProfile) onOpenProfile();
                else onOpenAuth();
              }}
              className="p-1.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 flex items-center gap-1.5 text-xs transition-all active:scale-95 cursor-pointer"
              title={`${user.name} (${user.role}) - प्रोफ़ाइल`}
            >
              <User className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span className="text-[11px] font-bold max-w-[70px] truncate hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-sm cursor-pointer"
              title="नया खाता बनाएं या लॉगिन करें"
            >
              <User className="w-3 h-3 text-black" />
              <span>लॉगिन</span>
            </button>
          )}

          {/* Top-Right Hamburger Menu (☰) */}
          <button
            onClick={onOpenHamburger}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white transition-all active:scale-95 cursor-pointer"
            title="मेन्यू (नियम, नीतियां, सेटिंग्स, शेयर)"
          >
            <Menu className="w-5 h-5 text-zinc-200" />
          </button>
        </div>
      </div>
    </header>
  );
};
