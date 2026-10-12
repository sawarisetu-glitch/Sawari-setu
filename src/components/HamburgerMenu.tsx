import React from 'react';
import {
  X,
  FileText,
  Lock,
  RefreshCw,
  Building,
  ShieldCheck,
  Share2,
  ChevronRight,
  ExternalLink,
  Scale,
  Download,
  History,
  Mic,
  Car,
  Truck,
  UserCheck,
  User,
  LogIn,
  LogOut,
  Settings,
  Phone,
  MapPin,
  FileCheck,
  Sparkles,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { Logo } from './Logo';
import { UserProfile, ServiceTab } from '../types';
import { openWhatsAppHelpline } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenSos: () => void;
  onOpenAuth: () => void;
  onOpenPolicies: (tab?: any) => void;
  onOpenDownload?: () => void;
  onOpenShare?: () => void;
  onOpenTripHistory?: () => void;
  onOpenProfile?: () => void;
  onOpenVoiceBooking?: () => void;
  onOpenDocumentUpload?: () => void;
  onOpenAiAssistant?: () => void;
  onNavigateTab?: (tab: ServiceTab) => void;
  onLogout?: () => void;
  onSwitchToWebsiteMode?: () => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenSos,
  onOpenAuth,
  onOpenPolicies,
  onOpenDownload,
  onOpenShare,
  onOpenTripHistory,
  onOpenProfile,
  onOpenVoiceBooking,
  onOpenDocumentUpload,
  onOpenAiAssistant,
  onNavigateTab,
  onLogout,
  onSwitchToWebsiteMode,
}) => {
  if (!isOpen) return null;

  const { theme, toggleTheme } = useTheme();

  const role = currentUser?.role || 'passenger';
  const isDriver = role === 'driver';
  const isAdmin = role === 'admin';
  const isCustomer = role === 'passenger' || !currentUser;

  const handleShareClick = () => {
    if (onOpenShare) {
      onClose();
      onOpenShare();
    } else if (navigator.share) {
      navigator
        .share({
          title: 'सवारी सेतु (Sawari Setu)',
          text: 'सफर आसान • साथ सबका! सवारी सेतु ऐप से बाइक, ऑटो, कैब व माल गाड़ी बुक करें।',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      openWhatsAppHelpline('सवारी सेतु ऐप लिंक: ' + window.location.href);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" showTagline={true} inline />
            {currentUser && (
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                  isAdmin
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : isDriver
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {isAdmin ? '🛡️ एडमिन' : isDriver ? '🚖 चालक साथी' : '👤 ग्राहक'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Helpline Strip */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 block">आधिकारिक हेल्पलाइन:</span>
              <span className="font-bold text-amber-400 text-sm">9450985355</span>
            </div>
            <button
              onClick={() => openWhatsAppHelpline()}
              className="px-3 py-1.5 rounded-xl bg-[#FF8C00] text-black font-extrabold text-[11px] hover:bg-orange-600 transition-all shadow-md cursor-pointer"
            >
              व्हाट्सएप सहायता
            </button>
          </div>

          {/* ======================================================== */}
          {/* 1. CUSTOMER ONLY SECTIONS (Only visible to Customer/Visitor) */}
          {/* ======================================================== */}
          {/* Switch to Full Website Portal */}
          {onSwitchToWebsiteMode && (
            <button
              onClick={() => {
                onClose();
                onSwitchToWebsiteMode();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 hover:brightness-125 border border-amber-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF8C00] text-black font-black group-hover:scale-105 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    🌐 पूरी वेबसाइट देखें (Full Website Portal)
                  </span>
                  <span className="text-[10px] text-amber-300">
                    बड़ा स्क्रीन लेआउट, लाइव राडार व संपूर्ण सेवाएं
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
            </button>
          )}

          {isCustomer && (
            <>
              {/* Voice Booking (Customer Only) */}
              {onOpenVoiceBooking && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenVoiceBooking();
                  }}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 hover:brightness-125 border border-amber-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FF8C00] text-black font-black group-hover:scale-105 transition-transform">
                      <Mic className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        बोलकर सवारी बुक करें (Voice Booking)
                      </span>
                      <span className="text-[10px] text-amber-300">
                        Hindi AI • बोलें "सिरसा से सिविल लाइंस, कार चाहिए"
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
                </button>
              )}

              {/* Gemini AI Multi-Talent Assistant & Chatbot */}
              {onOpenAiAssistant && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAiAssistant();
                  }}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 hover:brightness-125 border border-amber-500/30 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#FF8C00] to-amber-600 text-black font-black group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4 text-black animate-pulse" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        सवारी सेतु AI चैटबॉट (Multi-Talent Assistant)
                      </span>
                      <span className="text-[10px] text-amber-300">
                        सवारी, माल भाड़ा, Google Maps रूट व 24x7 गाइड
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
                </button>
              )}

              {/* Past Trips (Customer Only) */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold px-1">
                  ग्राहक सेवाएं (Customer Services)
                </h4>

                <button
                  onClick={() => {
                    onClose();
                    if (currentUser) {
                      onOpenTripHistory?.();
                    } else {
                      onOpenAuth();
                    }
                  }}
                  className="w-full p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF8C00] group-hover:scale-105 transition-transform">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        सवारी व माल ट्रिप इतिहास (Trip History)
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        पिछली बुकिंग, डिजिटल इनवॉइस व चालक रेटिंग
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Marketing Share (Customer Only) */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold px-1">
                  शेयर व कूपन (Referral & Offers)
                </h4>

                <button
                  onClick={handleShareClick}
                  className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/40 to-blue-950/40 hover:brightness-125 border border-zinc-700/80 text-left flex items-center justify-between transition-all shadow-md cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#FF8C00] text-black font-bold">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white block">
                        मित्रों को शेयर करें (WhatsApp / Social)
                      </span>
                      <span className="text-[10px] text-amber-400">
                        रेफर करें और पाएँ ₹50 डिस्काउंट कूपन
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </button>
              </div>
            </>
          )}

          {/* ======================================================== */}
          {/* 2. DRIVER ONLY SECTIONS (Only visible to Driver) */}
          {/* ======================================================== */}
          {isDriver && (
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold px-1">
                चालक साथी मेन्यू (Driver Workspace)
              </h4>

              {/* Driver Workspace Hub */}
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab?.('driver');
                }}
                className="w-full p-3 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/30 border border-emerald-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold group-hover:scale-105 transition-transform">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      चालक ड्यूटी डैशबोर्ड (Duty Hub)
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      ऑनलाइन/ऑफलाइन टॉगल, लाइव बुकिंग व दैनिक कमाई
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
              </button>

              {/* Driver Document Onboarding KYC */}
              <button
                onClick={() => {
                  onClose();
                  if (onOpenDocumentUpload) onOpenDocumentUpload();
                  else if (onOpenProfile) onOpenProfile();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 hover:brightness-125 border border-amber-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FF8C00] text-black font-extrabold group-hover:scale-105 transition-transform">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      कागजात सत्यापन केंद्र (Driver KYC Hub)
                    </span>
                    <span className="text-[10px] text-amber-300">
                      कमर्शियल DL, RC, बीमा, परमिट, PVC, बैंक पासबुक
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. ADMIN ONLY SECTIONS (Only visible to Admin) */}
          {/* ======================================================== */}
          {isAdmin && (
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase tracking-wider text-red-400 font-bold px-1">
                मास्टर एडमिन कंट्रोल (Admin Controls)
              </h4>

              {/* Admin Panel Hub */}
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab?.('admin');
                }}
                className="w-full p-3 rounded-2xl bg-red-950/30 hover:bg-red-900/30 border border-red-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-300 font-extrabold group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">
                      एडमिन कंट्रोल हब (Master Admin)
                    </span>
                    <span className="text-[10px] text-red-300">
                      लाइव फ्लीट मैप, KYC सत्यापन व 0% कमीशन नियंत्रण
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          )}

          {/* Common: App Download / Install Section */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold px-1">
              मोबाइल ऐप डाउनलोड (App Download)
            </h4>

            <button
              onClick={() => {
                onClose();
                if (onOpenDownload) onOpenDownload();
                else if (onOpenShare) onOpenShare();
              }}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-zinc-900 hover:brightness-125 border border-amber-500/40 text-left flex items-center justify-between transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF8C00] text-black font-extrabold group-hover:scale-105 transition-transform">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">
                    सवारी सेतु ऐप डाउनलोड करें (Install App)
                  </span>
                  <span className="text-[10px] text-amber-400">
                    Android / iPhone में 1-टैप में इंस्टॉल व QR कोड
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Common: Policies & Regulations Suite */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                नीतियां व नियम (Policies & Rules)
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenPolicies();
                }}
                className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <span>विस्तार से</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenPolicies('master_fare');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">मास्टर किराया नीति</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenPolicies('terms');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">नियम व शर्तें</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenPolicies('privacy');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">गोपनीयता नीति</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenPolicies('insurance');
                }}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-left flex items-center gap-2 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">पारगमन बीमा</span>
              </button>
            </div>
          </div>

          {/* Emergency SOS Quick Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenSos();
              }}
              className="w-full p-3 rounded-2xl bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 text-left flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-400" />
                <span className="font-bold text-red-300">
                  आपातकालीन SOS (Emergency Police/Ambulance)
                </span>
              </div>
              <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                112 / 108
              </span>
            </button>
          </div>

          {/* Appearance Theme Toggle in Hamburger Menu */}
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF8C00]">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  थीम (Appearance Theme)
                </span>
                <span className="text-[10px] text-zinc-400">
                  {theme === 'dark' ? 'डार्क मोड (Dark Mode)' : 'लाइट मोड (Light Mode)'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-[#FF8C00]' : 'bg-zinc-700'
              }`}
              aria-label="Toggle theme mode"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                {theme === 'dark' ? (
                  <Moon className="w-3 h-3 text-zinc-900" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </span>
            </button>
          </div>

          {/* Account Profile and Role Switch action */}
          <div className="pt-2 border-t border-zinc-800 space-y-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenProfile) onOpenProfile();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 font-extrabold flex items-center justify-between transition-all shadow-md group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF8C00]" />
                    <span>
                      {currentUser.name} ({currentUser.role === 'admin' ? 'एडमिन' : currentUser.role === 'driver' ? 'चालक' : 'ग्राहक'})
                    </span>
                  </div>
                  <Settings className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onLogout) onLogout();
                    else onOpenAuth();
                  }}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>लॉगआउट / भूमिका बदलें (Switch Role)</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-3 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>लॉगिन / नया खाता बनाएं (Choose Role)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 text-[10px] text-zinc-500 text-center">
          सवारी सेतु प्राइवेट लिमिटेड • CIN: U60200UP2024PTC189201 • सर्वाधिकार सुरक्षित © 2026
        </div>
      </div>
    </div>
  );
};
