import React, { useState } from 'react';
import {
  Car,
  Bike,
  Truck,
  Users,
  ShieldAlert,
  Download,
  Smartphone,
  PhoneCall,
  Sparkles,
  Mic,
  Star,
  CheckCircle2,
  Clock,
  Compass,
  Check,
  Info,
  ChevronRight,
  Calculator,
  ArrowRight,
  Shield,
  Zap,
  MessageCircle,
  FileText,
  UserCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Logo } from './Logo';
import { IndianVehicleBadge } from './IndianVehicleBadge';
import { getIndianVehicleImage } from '../utils/vehicleAssets';
import { RideBookingTab } from './RideBookingTab';
import { LogisticsBookingTab } from './LogisticsBookingTab';
import { DriverWorkspaceTab } from './DriverWorkspaceTab';
import { AdminPanelTab } from './AdminPanelTab';
import {
  ServiceTab,
  RideMode,
  RideBooking,
  LogisticsBooking,
  LiveVehicle,
  UserProfile,
} from '../types';
import { calculateMasterFare } from '../utils/fareEngine';
import { PolicyTab } from './LegalPoliciesModal';
import { openWhatsAppHelpline } from '../utils/storage';

interface WebsitePortalProps {
  currentUser: UserProfile | null;
  vehicles: LiveVehicle[];
  activeTab: ServiceTab;
  setActiveTab: (tab: ServiceTab) => void;
  activeRide: RideBooking | null;
  setActiveRide: (ride: RideBooking | null) => void;
  activeShipment: LogisticsBooking | null;
  setActiveShipment: (shipment: LogisticsBooking | null) => void;
  onOpenPayment: (amount: number, desc: string, ref: string) => void;
  onOpenSos: () => void;
  onOpenAuth: () => void;
  onOpenAiAssistant: () => void;
  onOpenDownload: () => void;
  onOpenTripHistory: () => void;
  onOpenProfile: () => void;
  onOpenVoiceBooking: () => void;
  onSwitchToAppMode: () => void;
  onOpenPolicies: (tab?: PolicyTab) => void;
  onTripCompleted: (ride: RideBooking) => void;
  onShipmentCompleted?: (shipment: LogisticsBooking) => void;
  completedRidesList?: RideBooking[];
  onOpenDocumentUpload?: () => void;
  initialVoiceBooking?: {
    pickup: string;
    destination: string;
    mode: RideMode;
    transcript?: string;
    directConfirm?: boolean;
  } | null;
  onClearInitialVoiceBooking?: () => void;
}

export const WebsitePortal: React.FC<WebsitePortalProps> = ({
  currentUser,
  vehicles,
  activeTab,
  setActiveTab,
  activeRide,
  setActiveRide,
  activeShipment,
  setActiveShipment,
  onOpenPayment,
  onOpenSos,
  onOpenAuth,
  onOpenAiAssistant,
  onOpenDownload,
  onOpenTripHistory,
  onOpenProfile,
  onOpenVoiceBooking,
  onSwitchToAppMode,
  onOpenPolicies,
  onTripCompleted,
  onShipmentCompleted,
  completedRidesList = [],
  onOpenDocumentUpload,
  initialVoiceBooking,
  onClearInitialVoiceBooking,
}) => {
  // Interactive Fare Calculator State on Website
  const [calcDistance, setCalcDistance] = useState(18);
  const [calcMode, setCalcMode] = useState<RideMode>('bike');
  const calcFareResult = calculateMasterFare({
    distanceKm: calcDistance,
    mode: calcMode,
    isNightHours: false,
  });

  const userRole = currentUser?.role || 'passenger';
  const isDriverUser = userRole === 'driver';
  const isAdminUser = userRole === 'admin';

  return (
    <div className="w-full min-h-screen bg-[#0a0a0d] text-zinc-100 flex flex-col font-sans selection:bg-[#FF8C00] selection:text-black">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="w-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-black py-1.5 px-4 text-xs font-black shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-black text-amber-300 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">
              लाइव
            </span>
            <span className="truncate">
              🚖 <strong>सवारी सेतु</strong> — प्रयागराज, मेजा, सिरसा, कोहड़ार, करछना व पूर्वांचल में सबसे तेज व सस्ती राइड सेवा!
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0 font-bold">
            <a
              href="tel:9450985355"
              className="flex items-center gap-1 hover:underline text-black font-extrabold"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>हेल्पलाइन: 9450985355</span>
            </a>
            <span className="hidden md:inline text-black/40">•</span>
            <button
              onClick={() => onOpenPolicies('terms')}
              className="hidden md:inline hover:underline cursor-pointer"
            >
              0% कैंसिलेशन शुल्क
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WEBSITE NAVBAR */}
      <header className="sticky top-0 z-50 w-full bg-[#111115]/95 backdrop-blur-md border-b border-zinc-800/80 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('ride');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer text-left focus:outline-none"
            >
              <Logo size="md" showTagline={true} inline />
            </button>
          </div>

          {/* Desktop Navigation Links matching all core app tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-zinc-300">
            {/* Tab 1: सवारी (Ride) */}
            <button
              onClick={() => {
                setActiveTab('ride');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ride'
                  ? 'bg-[#FF8C00] text-black font-extrabold shadow-md'
                  : 'hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>सवारी बुकिंग</span>
              {activeRide && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>

            {/* Tab 2: माल ढुलाई (Logistics) */}
            <button
              onClick={() => {
                setActiveTab('logistics');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'logistics'
                  ? 'bg-cyan-500 text-black font-extrabold shadow-md'
                  : 'hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>माल ढुलाई</span>
              {activeShipment && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>

            {/* Tab 3: चालक साथी (Driver Workspace) */}
            <button
              onClick={() => {
                setActiveTab('driver');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'driver'
                  ? 'bg-amber-400 text-black font-extrabold shadow-md'
                  : 'hover:text-amber-300 hover:bg-zinc-800 text-amber-400/90'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>चालक पार्टनर</span>
            </button>

            {/* Tab 4: प्रशासनिक पैनल (Admin Panel) */}
            <button
              onClick={() => {
                setActiveTab('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-red-500 text-white font-extrabold shadow-md'
                  : 'hover:text-red-300 hover:bg-zinc-800 text-red-400/90'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>प्रशासनिक पैनल</span>
            </button>

            {/* In-page Anchor: Fare Calculator */}
            <button
              onClick={() => {
                const el = document.getElementById('fare-calculator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1.5 text-zinc-300"
            >
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>किराया कैलकुलेटर</span>
            </button>

            {/* In-page Anchor: Safety & SOS */}
            <button
              onClick={() => {
                const el = document.getElementById('safety-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onOpenSos();
              }}
              className="px-3 py-2 rounded-xl hover:text-white hover:bg-red-950/40 text-red-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>सुरक्षा व SOS</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* View Mode Toggle Button: Switch to Compact Mobile App View */}
            <button
              onClick={onSwitchToAppMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              title="मोबाइल ऐप व्यू (Mobile App Frame) में बदलें"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF8C00]" />
              <span className="font-extrabold">📱 ऐप व्यू</span>
            </button>

            {/* 1-Tap Hindi AI Voice Booking */}
            <button
              onClick={onOpenVoiceBooking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold transition-all active:scale-95 cursor-pointer"
              title="हिंदी में बोलकर सवारी बुक करें"
            >
              <Mic className="w-3.5 h-3.5 text-[#FF8C00] animate-pulse" />
              <span className="hidden md:inline">बोलकर बुक करें</span>
            </button>

            {/* Quick SOS Red Emergency Button */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-bold transition-all shadow-sm active:scale-95 animate-pulse cursor-pointer"
              title="आपातकालीन सहायता (112 / 108 / SOS)"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="font-extrabold">SOS</span>
            </button>

            {/* User Profile or Login */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-750 hover:border-amber-500/50 text-xs font-bold text-zinc-100 transition-all cursor-pointer"
                title={`${currentUser.name} (${currentUser.role})`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-black flex items-center justify-center font-black text-xs">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {currentUser.name}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                लॉगिन
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. HERO OVERVIEW BAR & SEAMLESS SERVICE TABS */}
      <section className="w-full pt-4 pb-8 px-3 sm:px-6 bg-gradient-to-b from-[#111115] via-[#0d0d10] to-[#0a0a0d] border-b border-zinc-800">
        <div className="max-w-5xl mx-auto">
          {/* Service Switcher Tabs Banner (Responsive Mobile & Desktop) */}
          <div className="mb-4 p-2 bg-zinc-900/90 rounded-2xl border border-zinc-800 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveTab('ride')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'ride'
                    ? 'bg-[#FF8C00] text-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>🚖 सवारी बुकिंग</span>
                {activeRide && (
                  <span className="bg-emerald-500 text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
                    सक्रिय
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('logistics')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'logistics'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>🚚 माल ढुलाई (Freight)</span>
                {activeShipment && (
                  <span className="bg-cyan-400 text-black px-1.5 py-0.2 rounded-full text-[10px] font-black">
                    सक्रिय
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('driver')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'driver'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-amber-400 hover:bg-zinc-800'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>🚗 चालक पार्टनर</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-red-400 hover:bg-zinc-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>📊 एडमिन</span>
              </button>
            </div>

            {/* Quick Helper Badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-medium pr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{vehicles.length}+ गाड़ियां लाइव प्रयागराज व मेजा में</span>
            </div>
          </div>

          {/* ACTIVE MODULE CONTAINER (Renders the EXACT Same Components as the App) */}
          <div className="bg-[#141418] border border-zinc-800 rounded-3xl p-3 sm:p-6 shadow-2xl">
            {/* TAB 1: RIDE BOOKING */}
            {activeTab === 'ride' && (
              isDriverUser ? (
                <div className="p-8 rounded-3xl bg-zinc-950 border border-emerald-500/40 text-center space-y-4 max-w-md mx-auto my-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl">
                    🚖
                  </div>
                  <h3 className="text-base font-extrabold text-white">चालक पार्टनर मोड सक्रिय</h3>
                  <p className="text-xs text-zinc-300">
                    आप वर्तमान में चालक (Driver) के रूप में लॉग इन हैं। सवारी बुकिंग का विकल्प केवल ग्राहकों (Passengers) के लिए है।
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setActiveTab('driver')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-500 text-black font-extrabold text-xs"
                    >
                      चालक डैशबोर्ड पर जाएं
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-4 flex items-center justify-between pb-3 border-b border-zinc-850">
                    <div>
                      <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <span>🚖 सवारी सेतु लाइव राइड बुकिंग पोर्टल</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          100% कनेक्टेड
                        </span>
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        बाइक, ऑटो, कैब, ई-रिक्शा व 7-सीटर एसयूवी की लाइव ट्रैकिंग व तुरंत बुकिंग
                      </p>
                    </div>
                    <button
                      onClick={onOpenVoiceBooking}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all cursor-pointer"
                    >
                      <Mic className="w-3.5 h-3.5 text-[#FF8C00] animate-pulse" />
                      <span>बोलकर बुक करें</span>
                    </button>
                  </div>

                  {/* Complete Full-Featured RideBookingTab with Leaflet real-time simulated tracking */}
                  <RideBookingTab
                    currentUser={currentUser}
                    vehicles={vehicles}
                    activeRide={activeRide}
                    setActiveRide={setActiveRide}
                    onOpenPayment={onOpenPayment}
                    onOpenSos={onOpenSos}
                    onTripCompleted={onTripCompleted}
                    onRequireAuth={onOpenAuth}
                    initialVoiceBooking={initialVoiceBooking}
                    onClearInitialVoiceBooking={onClearInitialVoiceBooking}
                  />
                </div>
              )
            )}

            {/* TAB 2: LOGISTICS / GOODS BOOKING */}
            {activeTab === 'logistics' && (
              isDriverUser ? (
                <div className="p-8 rounded-3xl bg-zinc-950 border border-cyan-500/40 text-center space-y-4 max-w-md mx-auto my-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black text-2xl">
                    🚚
                  </div>
                  <h3 className="text-base font-extrabold text-white">माल ढुलाई ग्राहक सेवा</h3>
                  <p className="text-xs text-zinc-300">
                    माल बुकिंग का विकल्प केवल ग्राहकों के लिए है। चालक साथी अपने डैशबोर्ड पर माल परिवहन ऑर्डर प्राप्त कर सकते हैं।
                  </p>
                  <button
                    onClick={() => setActiveTab('driver')}
                    className="py-2.5 px-4 rounded-xl bg-[#FF8C00] text-black font-extrabold text-xs"
                  >
                    चालक ड्यूटी पर लौटें
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-4 pb-3 border-b border-zinc-850">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>🚚 माल ढुलाई व पार्सल लॉजिस्टिक्स पोर्टल</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                        100% कनेक्टेड
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      छोटा हाथी (Tata Ace), 3-व्हीलर लोडर, बोलेरो मैक्सी व 14ft ट्रक भाड़े पर बुक करें
                    </p>
                  </div>

                  <LogisticsBookingTab
                    currentUser={currentUser}
                    vehicles={vehicles}
                    activeShipment={activeShipment}
                    setActiveShipment={setActiveShipment}
                    onOpenPayment={onOpenPayment}
                    onTripCompleted={onShipmentCompleted}
                    onRequireAuth={onOpenAuth}
                  />
                </div>
              )
            )}

            {/* TAB 3: DRIVER WORKSPACE */}
            {activeTab === 'driver' && (
              <div className="w-full">
                <div className="mb-4 pb-3 border-b border-zinc-850 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <span>🚗 चालक साथी कार्यक्षेत्र (Driver Workspace)</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        0% कमीशन
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      ऑनलाइन ड्यूटी, नई सवारी ऑर्डर, ओटीपी सत्यापन, दैनिक कमाई व डिजिटल स्लिप
                    </p>
                  </div>
                  {!currentUser && (
                    <button
                      onClick={onOpenAuth}
                      className="px-3 py-1.5 rounded-xl bg-[#FF8C00] text-black font-extrabold text-xs shadow-md"
                    >
                      चालक लॉगिन
                    </button>
                  )}
                </div>

                {!isDriverUser && !currentUser && (
                  <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="text-xs text-amber-200">
                      <strong>चालक साथी ध्यान दें:</strong> अपनी गाड़ी जोड़कर हर महीने ₹25,000 - ₹50,000+ कमाएं। टेस्ट करने के लिए नीचे चालक डैशबोर्ड उपलब्ध है।
                    </div>
                    <button
                      onClick={onOpenAuth}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-black font-extrabold text-xs"
                    >
                      आईडी एक्टिवेट करें
                    </button>
                  </div>
                )}

                <DriverWorkspaceTab
                  currentUser={currentUser}
                  onOpenAuth={onOpenAuth}
                  completedRidesList={completedRidesList}
                  onOpenDocumentUpload={onOpenDocumentUpload}
                />
              </div>
            )}

            {/* TAB 4: ADMIN PANEL */}
            {activeTab === 'admin' && (
              <div className="w-full">
                <div className="mb-4 pb-3 border-b border-zinc-850">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <span>📊 प्रशासनिक नियंत्रण कक्ष (Master Admin Panel)</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                      सिक्योर एक्सेस
                    </span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    फ्लीट मॉनिटरिंग, सभी लाइव गाड़ियां, किराया दरें, चालक सत्यापन व राजस्व एनालिटिक्स
                  </p>
                </div>

                {!isAdminUser && (
                  <div className="mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-3">
                    <div className="text-xs text-red-200">
                      <strong>एडमिन एक्सेस:</strong> प्रशासनिक डेटा देखने के लिए एडमिन के रूप में लॉगिन करें या टेस्ट मोड में फ्लीट स्थिति जांचें।
                    </div>
                    <button
                      onClick={onOpenAuth}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs"
                    >
                      एडमिन लॉगिन
                    </button>
                  </div>
                )}

                <AdminPanelTab
                  currentUser={currentUser}
                  vehicles={vehicles}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES PORTFOLIO (सवारी सेतु की सेवाएं) */}
      <section className="w-full py-14 px-4 sm:px-6 bg-[#0c0c0e] border-b border-zinc-850">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">
              बहु-आयामी परिवहन सेवाएं
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              हर जरूरत के लिए सही सवारी और माल वाहक
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              प्रयागराज, मेजा, सिरसा, कोहड़ार, करछना व पूरे उत्तर प्रदेश में बाइक, ऑटो, कैब व माल ढुलाई 1 मिनट में बुक करें।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                vehicleKey: 'bike',
                title: 'बाइक टैक्सी (Bike Taxi)',
                tag: 'सबसे तेज व किफायती',
                price: '₹10/किमी',
                desc: 'ट्रैफिक से बचकर समय पर पहुँचें। अकेले कॉलेज, ऑफिस या स्टेशन जाने के लिए सर्वश्रेष्ठ विकल्प।',
                features: ['हेलमेट अनिवार्य व सुरक्षित', '3 मिनट में पिकअप', 'सस्ता बेस किराया'],
                action: () => {
                  setActiveTab('ride');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
              },
              {
                vehicleKey: 'auto',
                title: 'ऑटो व ई-रिक्शा (Auto & E-Rickshaw)',
                tag: 'स्थानीय बाजार व परिवार',
                price: '₹13/किमी',
                desc: 'स्थानीय बाजार, तहसील, कोर्ट व रेलवे स्टेशन के लिए सुविधाजनक। शेयरिंग व फुल बुकिंग दोनों उपलब्ध।',
                features: ['3-4 सवारियों की जगह', 'सामान रखने की सुविधा', 'किफायती यात्रा'],
                action: () => {
                  setActiveTab('ride');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
              },
              {
                vehicleKey: 'car_4_5',
                title: 'प्राइम कैब व सेडान (Car / Cab)',
                tag: 'एसी व आरामदायक',
                price: '₹30-40/किमी',
                desc: 'लंबी दूरी की यात्रा, प्रयागराज संगम, एयरपोर्ट व पारिवारिक सफर के लिए वातानुकूलित कारें।',
                features: ['पूर्ण एसी कम्फर्ट', 'टोल टैक्स शामिल', 'सत्यापित चालक साथी'],
                action: () => {
                  setActiveTab('ride');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
              },
              {
                vehicleKey: 'suv',
                title: '7-सीटर SUV (Family SUV)',
                tag: 'शादी, पार्टी व टूर',
                price: '₹35-40/किमी',
                desc: 'बड़े परिवार के साथ सफर, शादी-समारोह व आउटस्टेशन टूर के लिए बोलेरो, स्कॉर्पियो व अर्टिगा।',
                features: ['6-7 सवारियों की आरामदायक सीटिंग', 'बड़ा बूट स्पेस', 'अनुभवी हाईवे ड्राइवर'],
                action: () => {
                  setActiveTab('ride');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
              },
              {
                vehicleKey: 'tata_ace',
                title: 'छोटा हाथी व पिकअप (Tata Ace / Freight)',
                tag: 'व्यापारिक व घरेलू माल ढुलाई',
                price: '₹26/किमी से',
                desc: 'दुकान का सामान, निर्माण सामग्री, कृषि उपज और घर का सामान सुरक्षित शिफ्ट करें।',
                features: ['लाइव ट्रैकिंग', 'लोडिंग/अनलोडिंग सहायता', 'डिजिटल जीएसटी बिल'],
                action: () => {
                  setActiveTab('logistics');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                },
              },
              {
                vehicleKey: 'bike',
                title: 'वॉकर व पार्सल सेवा (Courier & Errands)',
                tag: 'तुरंत होम डिलीवरी',
                price: '₹35 से शुरू',
                desc: 'दवा, किराना, भोजन या जरूरी सरकारी दस्तावेज सीधे आपके घर से गंतव्य तक पहुंचाएं।',
                features: ['सुरक्षित ओटीपी हैंडओवर', '1 घंटे में डिलीवरी', 'लोकल डिलीवरी पार्टनर'],
                action: () => {
                  onOpenVoiceBooking();
                },
              },
            ].map((svc, i) => (
              <div
                key={i}
                className="bg-[#15151a] border border-zinc-800/80 hover:border-amber-500/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <IndianVehicleBadge
                      vehicleType={svc.vehicleKey}
                      size="lg"
                      showBorder={true}
                      className="border-amber-500/40 shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {svc.price}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                    {svc.tag}
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">{svc.desc}</p>
                  <ul className="space-y-1.5 mb-6 text-xs text-zinc-300">
                    {svc.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={svc.action}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-[#FF8C00] text-zinc-200 hover:text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span>अभी बुक करें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE FARE CALCULATOR SECTION */}
      <section
        id="fare-calculator-section"
        className="w-full py-14 px-4 sm:px-6 bg-[#0e0e12] border-b border-zinc-850"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              पारदर्शी किराया प्रणाली
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              सवारी सेतु लाइव किराया कैलकुलेटर
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              यात्रा से पहले अपना सटीक किराया देखें — कोई छुपा चार्ज या मीटर की धांधली नहीं।
            </p>
          </div>

          <div className="bg-[#16161b] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Left: Interactive Controls */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-2">
                    वाहन का चयन करें:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'bike' as RideMode, name: 'बाइक टैक्सी' },
                      { id: 'auto' as RideMode, name: 'ऑटो रिक्शा' },
                      { id: 'car_4_5' as RideMode, name: '4-सीटर कैब' },
                      { id: 'suv' as RideMode, name: '7-सीटर SUV' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCalcMode(item.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          calcMode === item.id
                            ? 'bg-[#FF8C00] text-black border-amber-400 font-extrabold shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        <IndianVehicleBadge
                          vehicleType={item.id}
                          size="sm"
                          showBorder={false}
                          className="shrink-0"
                        />
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2">
                    <span>अनुमानित यात्रा दूरी (Distance):</span>
                    <span className="text-amber-400 text-base font-black">
                      {calcDistance} किमी (KM)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="150"
                    step="1"
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF8C00]"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-bold">
                    <span>1 किमी</span>
                    <span>50 किमी</span>
                    <span>100 किमी</span>
                    <span>150 किमी</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                    <Info className="w-4 h-4 text-amber-400" />
                    <span>सवारी सेतु नीति:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    टोल टैक्स ग्राहक के कुल किराए में पहले से शामिल रहता है। यात्रा के दौरान चालक को अलग से कोई अतिरिक्त राशि नहीं देनी होती।
                  </p>
                </div>
              </div>

              {/* Right: Price Breakdown Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-500/40 space-y-4 shadow-xl">
                <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-400 uppercase">
                    किराया विवरण (Fare Breakdown)
                  </span>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {calcFareResult.modeTitle}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-300">
                    <span>बेस फेयर (शुरुआती शुल्क):</span>
                    <span className="font-bold">₹{calcFareResult.baseFare}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>दूरी शुल्क ({calcDistance} किमी):</span>
                    <span className="font-bold">₹{calcFareResult.distanceFare}</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>टोल टैक्स:</span>
                    <span className="font-bold text-emerald-400">शामिल (₹0 अतिरिक्त)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>सवारी सुरक्षा शुल्क:</span>
                    <span className="font-bold text-emerald-400">मुफ्त (₹0)</span>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 font-bold">अनुमानित कुल किराया</span>
                    <div className="text-[10px] text-zinc-500">सभी टैक्स सहित</div>
                  </div>
                  <div className="text-3xl font-black text-[#FF8C00]">
                    ₹{calcFareResult.totalFare}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ride');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full py-3 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <span>इस किराए पर अभी राइड बुक करें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DRIVER PARTNER RECRUITMENT SECTION (चालक साथी बनें) */}
      <section className="w-full py-14 px-4 sm:px-6 bg-gradient-to-r from-amber-950/40 via-zinc-950 to-orange-950/40 border-b border-zinc-850 relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black inline-block">
                🤝 ड्राइवर पार्टनर प्रोग्राम
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                अपनी बाइक, ऑटो, कार या पिकअप से कमाएं <br />
                <span className="text-[#FF8C00]">₹25,000 - ₹50,000+ प्रति माह</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                सवारी सेतु से अपनी गाड़ी जोड़ें। हम आपके क्षेत्र (मेजा, सिरसा, प्रयागराज) के स्थानीय चालकों को सम्मान, सुरक्षा और उच्चतम कमाई का अवसर प्रदान करते हैं।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  { title: '0% कंपनी कमीशन', desc: 'शुरुआती 6 महीने राइड का 100% पैसा आपका' },
                  { title: 'तुरंत बैंक / UPI भुगतान', desc: 'हर ट्रिप के बाद तुरंत दैनिक कमाई की निकासी' },
                  { title: 'स्थानीय कार्यालय सहायता', desc: 'सिरसा व प्रयागराज में व्यक्तिगत सहायता' },
                  { title: 'फ्लेक्सिबल ड्यूटी', desc: 'अपनी मर्जी से जब चाहें ऑनलाइन/ऑफलाइन हों' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('driver');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="py-3 px-6 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-sm shadow-xl shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  चालक के रूप में रजिस्टर करें
                </button>
                <a
                  href="tel:9450985355"
                  className="py-3 px-5 rounded-2xl bg-zinc-900 border border-zinc-750 text-zinc-200 hover:text-white font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-amber-400" />
                  <span>ड्राइवर हेल्पलाइन: 9450985355</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center font-black text-3xl">
                🚖
              </div>
              <h3 className="text-lg font-black text-white">
                जरूरी दस्तावेज (Required Documents)
              </h3>
              <p className="text-xs text-zinc-400">
                10 मिनट में आसान ऑनलाइन सत्यापन और तुरंत आईडी एक्टिवेशन
              </p>

              <div className="space-y-2 text-left text-xs">
                {[
                  'ड्राइविंग लाइसेंस (DL)',
                  'आधार कार्ड (Aadhaar Card)',
                  'गाड़ी की RC (Vehicle Registration)',
                  'गाड़ी का बीमा (Insurance Policy)',
                  'बैंक खाता या UPI ID (भुगतान के लिए)',
                ].map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-zinc-800/80 text-zinc-300 font-medium"
                  >
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onOpenDocumentUpload) onOpenDocumentUpload();
                  else {
                    setActiveTab('driver');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold text-xs border border-amber-500/30 cursor-pointer"
              >
                दस्तावेज अपलोड करें
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SAFETY FIRST & SOS HIGHLIGHTS (सुरक्षा हमारी प्राथमिकता) */}
      <section
        id="safety-section"
        className="w-full py-14 px-4 sm:px-6 bg-[#0c0c0e] border-b border-zinc-850"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-red-400 tracking-wider uppercase">
              सुरक्षित यात्रा का वादा
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              आपकी और आपके परिवार की सुरक्षा हमारी पहली प्राथमिकता
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              सवारी सेतु हर राइड पर अत्याधुनिक सुरक्षा तकनीक और स्थानीय पुलिस नेटवर्क के साथ काम करता है।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#15151a] border border-red-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center font-black">
                <ShieldAlert className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-black text-white">24x7 इमरजेंसी SOS बटन</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ऐप और वेबसाइट में केवल 1 क्लिक पर डायल 112 (यूपी पुलिस), 108 (एम्बुलेंस) और सवारी सेतु इमरजेंसी कंट्रोल रूम को लाइव अलर्ट भेजा जाता है।
              </p>
              <button
                onClick={onOpenSos}
                className="w-full mt-2 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 font-bold text-xs border border-red-500/40 cursor-pointer"
              >
                इमरजेंसी SOS टेस्ट करें
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#15151a] border border-emerald-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                <Compass className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-base font-black text-white">रियल-टाइम लाइव लोकेशन शेयरिंग</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                अपनी यात्रा की लाइव लोकेशन WhatsApp के माध्यम से परिजनों के साथ 1 क्लिक में साझा करें, ताकि वे जान सकें आप कहाँ हैं।
              </p>
              <button
                onClick={() => {
                  const shareText = `*🚖 सवारी सेतु सुरक्षा अलर्ट*\nमैं सवारी सेतु से यात्रा कर रहा/रही हूँ।\n24x7 सुरक्षा हेल्पलाइन: +91 9450985355\nपुलिस सहायता: 112`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                }}
                className="w-full mt-2 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 cursor-pointer"
              >
                WhatsApp पर लोकेशन शेयर करें
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-[#15151a] border border-amber-500/30 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                <UserCheck className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-base font-black text-white">100% पुलिस व आरटीओ सत्यापित चालक</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                प्रत्येक चालक का बैकग्राउंड वेरिफिकेशन, वैध लाइसेंस, और गाड़ी के फिटनेस दस्तावेजों की गहन जांच के बाद ही ऑनबोर्डिंग की जाती है।
              </p>
              <div className="pt-2 text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>सुरक्षित व भरोसेमंद यात्रा अनुभव</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. DOWNLOAD APP & PWA SECTION */}
      <section className="w-full py-14 px-4 sm:px-6 bg-[#111116] border-b border-zinc-850">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black">
                📲 मोबाइल अनुभव
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                सवारी सेतु ऐप अपने मोबाइल में डाउनलोड करें
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                ऐप या वेबसाइट दोनों 100% एक समान और एक साथ जुड़े हैं। एक बार लॉग इन करें और अपनी सभी राइड्स, इनवॉइस व लाइव ट्रैकिंग किसी भी डिवाइस पर एक्सेस करें।
              </p>
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>एंड्रॉइड स्मार्टफोन के लिए आधिकारिक PWA व APK</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>ऑफ़लाइन राइड रसीद व डिजिटल इनवॉइस डाउनलोड</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>बोलकर सवारी बुक करने की हिंदी AI वॉइस सुविधा</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenDownload}
                  className="py-3 px-6 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>सवारी सेतु ऐप इंस्टॉल करें</span>
                </button>
                <button
                  type="button"
                  onClick={onSwitchToAppMode}
                  className="py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>ऐप व्यू टेस्ट करें</span>
                </button>
              </div>
            </div>

            <div className="bg-[#15151a] border border-zinc-800 rounded-3xl p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center font-black text-3xl">
                📱
              </div>
              <h3 className="text-base font-black text-white">तुरंत मोबाइल पर खोलें</h3>
              <p className="text-xs text-zinc-400">
                ब्राउज़र मेन्यू में जाकर "Add to Home Screen" पर क्लिक करें और बिना ऐप स्टोर के तुरंत इंस्टॉल करें।
              </p>
              <div className="p-3 bg-black/40 rounded-2xl border border-zinc-800 text-xs font-mono text-amber-300">
                https://sawarisetu.com
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS & STATS */}
      <section className="w-full py-14 px-4 sm:px-6 bg-[#0c0c0e] border-b border-zinc-850">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-center">
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">1,200+</div>
              <div className="text-xs text-zinc-400 mt-1 font-bold">दैनिक सुरक्षित यात्राएं</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">4.9 ★</div>
              <div className="text-xs text-zinc-400 mt-1 font-bold">औसत ग्राहक रेटिंग</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400">45+ गाड़ियां</div>
              <div className="text-xs text-zinc-400 mt-1 font-bold">सत्यापित स्थानीय फ्लीट</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#141418] border border-zinc-800">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">0%</div>
              <div className="text-xs text-zinc-400 mt-1 font-bold">हिडन या कैंसिलेशन चार्ज</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. GRAND OFFICIAL FOOTER */}
      <footer className="w-full bg-[#08080a] text-zinc-400 pt-12 pb-8 px-4 sm:px-6 border-t border-zinc-850">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Col 1: About & Registration */}
            <div className="space-y-3">
              <Logo size="md" showTagline={true} inline />
              <p className="text-xs leading-relaxed text-zinc-400">
                सवारी सेतु प्रयागराज व पूर्वांचल का अग्रणी डिजिटल राइड-हेलिंग व माल ढुलाई प्लेटफॉर्म है। स्थानीय समुदाय, छात्रों, परिवारों व किसानों के लिए समर्पित।
              </p>
              <div className="text-[11px] text-zinc-400 space-y-1 pt-1">
                <div>
                  <strong>पंजीकृत कार्यालय:</strong> दशमी का बाग, सिरसा टाउन, मेजा, प्रयागराज, उत्तर प्रदेश - 212305
                </div>
                <div>
                  <strong>हेल्पलाइन:</strong>{' '}
                  <a href="tel:9450985355" className="text-amber-400 font-bold hover:underline">
                    +91 9450985355
                  </a>
                </div>
                <div>
                  <strong>ईमेल:</strong>{' '}
                  <a href="mailto:sawarisetu@gmail.com" className="text-amber-400 hover:underline">
                    sawarisetu@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Col 2: Services */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                हमारी परिवहन सेवाएं
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('ride');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🏍️ बाइक टैक्सी बुकिंग
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('ride');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🛺 ऑटो रिक्शा व ई-रिक्शा
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('ride');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🚗 4-सीटर एसी कार / कैब
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('ride');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🚙 7-सीटर फैमिली SUV
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('logistics');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🚚 माल ढुलाई (Tata Ace / Freight)
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Quick Links */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                महत्वपूर्ण लिंक
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('driver');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🤝 चालक पार्टनर के रूप में जुड़ें
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPolicies('terms')}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    📜 नियम व शर्तें (Terms of Service)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPolicies('privacy')}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🔒 गोपनीयता नीति (Privacy Policy)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPolicies('refund')}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    💳 कैंसिलेशन व रिफंड नीति
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onOpenPolicies('insurance')}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    🛡️ यात्री सुरक्षा व गाइडलाइंस
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setActiveTab('admin');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    ⚙️ मास्टर एडमिन पैनल
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: 24x7 Helpline & Switch View */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                24x7 संपर्क व सहायता
              </h4>
              <p className="text-xs text-zinc-400">
                किसी भी समस्या, बुकिंग सहायता या चालक ऑनबोर्डिंग के लिए तुरंत संपर्क करें:
              </p>
              <div className="space-y-2">
                <a
                  href="tel:9450985355"
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-amber-300 font-extrabold text-xs hover:border-amber-500/50 transition-all"
                >
                  <PhoneCall className="w-4 h-4 text-[#FF8C00]" />
                  <span>+91 9450985355</span>
                </a>
                <button
                  type="button"
                  onClick={() => openWhatsAppHelpline()}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] font-extrabold text-xs hover:bg-[#25D366]/30 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp हेल्पलाइन</span>
                </button>
              </div>

              {/* View Switcher in Footer */}
              <div className="pt-2">
                <button
                  onClick={onSwitchToAppMode}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF8C00]" />
                  <span>📱 मोबाइल ऐप व्यू में स्विच करें</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <div>
              © 2026 <strong>सवारी सेतु (Sawari Setu)</strong>। सर्वाधिकार सुरक्षित। सफर आसान • साथ सबका।
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenPolicies('terms')}
                className="hover:underline cursor-pointer"
              >
                नियम व शर्तें
              </button>
              <span>•</span>
              <button
                onClick={() => onOpenPolicies('privacy')}
                className="hover:underline cursor-pointer"
              >
                गोपनीयता नीति
              </button>
              <span>•</span>
              <button
                onClick={onSwitchToAppMode}
                className="text-amber-400 hover:underline cursor-pointer font-bold"
              >
                मोबाइल ऐप व्यू
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
