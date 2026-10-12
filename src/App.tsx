/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { RideBookingTab } from './components/RideBookingTab';
import { LogisticsBookingTab } from './components/LogisticsBookingTab';
import { DriverWorkspaceTab } from './components/DriverWorkspaceTab';
import { AdminPanelTab } from './components/AdminPanelTab';
import { AiAssistantModal } from './components/AiAssistantModal';
import { HamburgerMenu } from './components/HamburgerMenu';
import { EmergencySosModal } from './components/EmergencySosModal';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { LegalPoliciesModal, PolicyTab } from './components/LegalPoliciesModal';
import { DownloadModal } from './components/DownloadModal';
import { TripHistoryModal } from './components/TripHistoryModal';
import { RatingFeedbackModal } from './components/RatingFeedbackModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { VoiceBookingModal } from './components/VoiceBookingModal';
import { WebsitePortal } from './components/WebsitePortal';
import { ServiceTab, UserProfile, RideBooking, LogisticsBooking, RideMode } from './types';
import { INITIAL_USER, INITIAL_FLEET } from './utils/storage';
import { Mic, Globe, Smartphone } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('sawari_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState<ServiceTab>('ride');

  // Website Portal vs App View Mode
  const [viewMode, setViewMode] = useState<'website' | 'app'>(() => {
    try {
      const saved = localStorage.getItem('sawari_view_mode');
      if (saved === 'website' || saved === 'app') return saved;
      return 'website';
    } catch {
      return 'website';
    }
  });

  const toggleViewMode = (mode: 'website' | 'app') => {
    setViewMode(mode);
    try {
      localStorage.setItem('sawari_view_mode', mode);
    } catch {}
  };

  // Check URL query/hash for direct download landing
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.location.search.includes('download') ||
        window.location.hash.includes('download')
      ) {
        setIsDownloadOpen(true);
      }
    }
  }, []);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<PolicyTab>('terms');
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isTripHistoryOpen, setIsTripHistoryOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileInitialTab, setProfileInitialTab] = useState<'documents' | 'profile' | 'vehicle'>('documents');
  const [isGlobalVoiceModalOpen, setIsGlobalVoiceModalOpen] = useState(false);
  const [pendingVoiceBooking, setPendingVoiceBooking] = useState<{
    pickup: string;
    destination: string;
    mode: RideMode;
    transcript?: string;
    directConfirm?: boolean;
  } | null>(null);

  // Rating Feedback Modal state
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    tripId: string;
    tripTitle: string;
    tripType: 'ride' | 'logistics';
  }>({
    isOpen: false,
    tripId: '',
    tripTitle: '',
    tripType: 'ride',
  });

  // Completed history stored in localStorage
  const [completedRides, setCompletedRides] = useState<RideBooking[]>(() => {
    try {
      const saved = localStorage.getItem('sawari_completed_rides');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [completedShipments, setCompletedShipments] = useState<LogisticsBooking[]>(() => {
    try {
      const saved = localStorage.getItem('sawari_completed_shipments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleRideCompleted = (ride: RideBooking) => {
    setCompletedRides((prev) => {
      const updated = [ride, ...prev.filter((r) => r.id !== ride.id)];
      try {
        localStorage.setItem('sawari_completed_rides', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleShipmentCompleted = (shipment: LogisticsBooking) => {
    setCompletedShipments((prev) => {
      const updated = [shipment, ...prev.filter((s) => s.id !== shipment.id)];
      try {
        localStorage.setItem('sawari_completed_shipments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleOpenPolicies = (tab: PolicyTab = 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  const handleOpenRating = (tripId: string, tripTitle: string, tripType: 'ride' | 'logistics') => {
    setRatingModal({
      isOpen: true,
      tripId,
      tripTitle,
      tripType,
    });
  };

  // Payment Modal state
  const [paymentData, setPaymentData] = useState<{
    isOpen: boolean;
    amount: number;
    description: string;
    referenceId: string;
  }>({
    isOpen: false,
    amount: 0,
    description: '',
    referenceId: '',
  });

  // Active bookings state
  const [activeRide, setActiveRide] = useState<RideBooking | null>(null);
  const [activeShipment, setActiveShipment] = useState<LogisticsBooking | null>(null);

  // Live vehicles data
  const [vehicles] = useState(INITIAL_FLEET);

  const handleOpenPayment = (amount: number, description: string, referenceId: string) => {
    setPaymentData({
      isOpen: true,
      amount,
      description,
      referenceId,
    });
  };

  const handlePaymentSuccess = (_method: string, _txId: string) => {
    if (activeRide && activeRide.id === paymentData.referenceId) {
      setActiveRide((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : null));
    }
    if (activeShipment && activeShipment.id === paymentData.referenceId) {
      setActiveShipment((prev) => (prev ? { ...prev, paymentStatus: 'paid' } : null));
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('sawari_auth_user');
    } catch {}
    setCurrentUser(null);
    setActiveTab('ride');
    setIsAuthOpen(true);
  };

  const userRole = currentUser?.role || 'passenger';
  const isDriverUser = userRole === 'driver';
  const isAdminUser = userRole === 'admin';
  const isCustomerUser = userRole === 'passenger' || !currentUser;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col selection:bg-[#FF8C00] selection:text-black">
      {viewMode === 'website' ? (
        <WebsitePortal
          currentUser={currentUser}
          vehicles={vehicles}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeRide={activeRide}
          setActiveRide={setActiveRide}
          activeShipment={activeShipment}
          setActiveShipment={setActiveShipment}
          onOpenPayment={handleOpenPayment}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAiAssistant={() => setIsAiModalOpen(true)}
          onOpenDownload={() => setIsDownloadOpen(true)}
          onOpenTripHistory={() => setIsTripHistoryOpen(true)}
          onOpenProfile={() => {
            if (!currentUser) setIsAuthOpen(true);
            else {
              setProfileInitialTab('profile');
              setIsProfileModalOpen(true);
            }
          }}
          onOpenDocumentUpload={() => {
            if (!currentUser) setIsAuthOpen(true);
            else {
              setProfileInitialTab('documents');
              setIsProfileModalOpen(true);
            }
          }}
          onOpenVoiceBooking={() => setIsGlobalVoiceModalOpen(true)}
          onSwitchToAppMode={() => toggleViewMode('app')}
          onOpenPolicies={handleOpenPolicies}
          onTripCompleted={handleRideCompleted}
          onShipmentCompleted={handleShipmentCompleted}
          completedRidesList={completedRides}
          initialVoiceBooking={pendingVoiceBooking}
          onClearInitialVoiceBooking={() => setPendingVoiceBooking(null)}
        />
      ) : (
        <div className="w-full flex justify-center flex-1">
          <div className="w-full max-w-xl min-h-screen bg-[#121212] flex flex-col border-x border-zinc-800/60 shadow-2xl relative">
            {/* Top Application Header */}
            <Header
              user={currentUser}
              onOpenAiAssistant={() => setIsAiModalOpen(true)}
              onOpenHamburger={() => setIsHamburgerOpen(true)}
              onOpenSos={() => setIsSosOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenDownload={() => setIsDownloadOpen(true)}
              onOpenShare={() => setIsDownloadOpen(true)}
              onOpenTripHistory={() => setIsTripHistoryOpen(true)}
              onOpenProfile={() => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  setProfileInitialTab('documents');
                  setIsProfileModalOpen(true);
                }
              }}
              onOpenVoiceBooking={() => setIsGlobalVoiceModalOpen(true)}
              onSwitchToWebsiteMode={() => toggleViewMode('website')}
            />

            {/* Main Responsive Centered Viewport Container */}
            <main className="flex-1 w-full px-3 sm:px-4 py-3 pb-24">
        {/* Tab 1: सवारी (Ride Booking - Customer Only) */}
        {activeTab === 'ride' && (
          isDriverUser ? (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-emerald-500/40 text-center space-y-4 max-w-md mx-auto my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                🚖
              </div>
              <h3 className="text-base font-extrabold text-white">चालक पार्टनर मोड सक्रिय</h3>
              <p className="text-xs text-zinc-300">
                आप वर्तमान में चालक (Driver) के रूप में लॉग इन हैं। सवारी बुकिंग का विकल्प केवल ग्राहकों (Passengers) के लिए है।
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('driver')}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs"
                >
                  चालक डैशबोर्ड पर जाएं
                </button>
                <button
                  onClick={handleLogout}
                  className="py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-750 text-zinc-300 font-bold text-xs"
                >
                  ग्राहक मोड में लॉगिन
                </button>
              </div>
            </div>
          ) : (
            <RideBookingTab
              currentUser={currentUser}
              vehicles={vehicles}
              activeRide={activeRide}
              setActiveRide={setActiveRide}
              onOpenPayment={handleOpenPayment}
              onOpenSos={() => setIsSosOpen(true)}
              onTripCompleted={handleRideCompleted}
              onRequireAuth={() => setIsAuthOpen(true)}
              initialVoiceBooking={pendingVoiceBooking}
              onClearInitialVoiceBooking={() => setPendingVoiceBooking(null)}
            />
          )
        )}

        {/* Tab 2: माल (Logistics / Goods Booking - Customer Only) */}
        {activeTab === 'logistics' && (
          isDriverUser ? (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-emerald-500/40 text-center space-y-4 max-w-md mx-auto my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-black">
                🚚
              </div>
              <h3 className="text-base font-extrabold text-white">माल ढुलाई ग्राहक सेवा</h3>
              <p className="text-xs text-zinc-300">
                माल बुकिंग का विकल्प केवल ग्राहकों के लिए है। चालक साथी अपने डैशबोर्ड पर माल परिवहन ऑर्डर प्राप्त कर सकते हैं।
              </p>
              <button
                onClick={() => setActiveTab('driver')}
                className="w-full py-2.5 rounded-xl bg-[#FF8C00] text-black font-extrabold text-xs"
              >
                चालक ड्यूटी पर लौटें
              </button>
            </div>
          ) : (
            <LogisticsBookingTab
              currentUser={currentUser}
              vehicles={vehicles}
              activeShipment={activeShipment}
              setActiveShipment={setActiveShipment}
              onOpenPayment={handleOpenPayment}
              onTripCompleted={handleShipmentCompleted}
              onRequireAuth={() => setIsAuthOpen(true)}
            />
          )
        )}

        {/* Tab 3: ड्राइवर (Driver Workspace - Driver Only) */}
        {activeTab === 'driver' && (
          !isDriverUser ? (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-amber-500/40 text-center space-y-4 max-w-md mx-auto my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center font-black text-xl">
                🔒
              </div>
              <div>
                <h3 className="text-base font-black text-white">चालक पार्टनर सेक्शन सुरक्षित है</h3>
                <p className="text-xs text-zinc-300 mt-1">
                  यह अनुभाग केवल अधिकृत चालक साथियों (Drivers) के लिए है। ग्राहक मोड में सवारी व माल बुकिंग की सुविधा उपलब्ध है।
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('ride')}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  सवारी बुकिंग पर जाएं
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF8C00] text-black font-black text-xs hover:bg-orange-600 transition-all shadow-md"
                >
                  चालक लॉगिन करें
                </button>
              </div>
            </div>
          ) : (
            <DriverWorkspaceTab
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthOpen(true)}
              completedRidesList={completedRides}
              onOpenDocumentUpload={() => {
                setProfileInitialTab('documents');
                setIsProfileModalOpen(true);
              }}
            />
          )
        )}

        {/* Tab 4: एडमिन (Admin Panel - Admin Only) */}
        {activeTab === 'admin' && (
          !isAdminUser ? (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-red-500/50 text-center space-y-4 max-w-md mx-auto my-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center font-black text-xl">
                🛡️
              </div>
              <div>
                <h3 className="text-base font-black text-white">मास्टर एडमिन एक्सेस प्रतिबंधित</h3>
                <p className="text-xs text-zinc-300 mt-1">
                  यह अनुभाग केवल अधिकृत एडमिन (+91 9450985355 / sawarisetu@gmail.com) के लिए आरक्षित है। सामान्य उपयोगकर्ता इसे नहीं देख सकते।
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab(isDriverUser ? 'driver' : 'ride')}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs"
                >
                  वापस जाएं
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition-all shadow-md"
                >
                  एडमिन सत्यापन लॉगिन
                </button>
              </div>
            </div>
          ) : (
            <AdminPanelTab
              currentUser={currentUser}
              vehicles={vehicles}
            />
          )
        )}
      </main>

      {/* Fixed Bottom Navigation (Role-Isolated Tabs) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        currentUser={currentUser}
        activeRidesCount={activeRide ? 1 : 0}
        pendingKycCount={2}
        onOpenTripHistory={() => setIsTripHistoryOpen(true)}
        onOpenProfile={() => {
          if (!currentUser) setIsAuthOpen(true);
          else {
            setProfileInitialTab('profile');
            setIsProfileModalOpen(true);
          }
        }}
        onOpenDocumentUpload={() => {
          if (!currentUser) setIsAuthOpen(true);
          else {
            setProfileInitialTab('documents');
            setIsProfileModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Floating 1-Tap Voice Booking Mic Button (Available in Mobile App View) */}
      <button
        type="button"
        onClick={() => setIsGlobalVoiceModalOpen(true)}
        className="fixed bottom-20 right-4 z-30 p-3.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-tr from-[#FF8C00] to-amber-500 text-black shadow-2xl shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-amber-300 ring-4 ring-black/50 group cursor-pointer"
        title="बोलकर सवारी बुक करें (Hindi AI Voice Booking)"
      >
        <Mic className="w-5 h-5 text-black group-hover:scale-110 transition-transform animate-pulse" />
        <span className="text-xs font-black hidden sm:inline tracking-tight">बोलकर बुक करें</span>
      </button>

      {/* Floating Quick Switcher to Website View (In Mobile App View) */}
      <button
        type="button"
        onClick={() => toggleViewMode('website')}
        className="fixed bottom-32 right-4 z-30 px-3 py-2 rounded-full bg-zinc-900 hover:bg-black text-amber-400 border border-amber-500/40 shadow-xl flex items-center gap-1.5 text-xs font-black transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
        title="पूरी वेबसाइट देखें (Full Website View)"
      >
        <Globe className="w-3.5 h-3.5 text-[#FF8C00]" />
        <span>🌐 वेबसाइट</span>
      </button>
    </div>
  </div>
)}

      {/* Floating Interactive Modals */}
      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentContext={
          activeTab === 'ride'
            ? 'Passenger Ride Booking'
            : activeTab === 'logistics'
            ? 'Goods Freight Logistics'
            : activeTab === 'driver'
            ? 'Driver Workspace'
            : 'Admin Master Panel'
        }
      />

      <HamburgerMenu
        isOpen={isHamburgerOpen}
        onClose={() => setIsHamburgerOpen(false)}
        currentUser={currentUser}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPolicies={handleOpenPolicies}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenShare={() => setIsDownloadOpen(true)}
        onOpenTripHistory={() => setIsTripHistoryOpen(true)}
        onOpenProfile={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setProfileInitialTab('documents');
            setIsProfileModalOpen(true);
          }
        }}
        onOpenVoiceBooking={() => setIsGlobalVoiceModalOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
        onOpenDocumentUpload={() => {
          if (!currentUser) {
            setIsAuthOpen(true);
          } else {
            setProfileInitialTab('documents');
            setIsProfileModalOpen(true);
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          toggleViewMode('app');
        }}
        onLogout={handleLogout}
        onSwitchToWebsiteMode={() => toggleViewMode('website')}
      />

      <EmergencySosModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentLocationName="दशमी का बाग, सिरसा, मेजा, प्रयागराज - 212305 (GPS Tracked)"
        userPhone={currentUser?.phone || '9450985355'}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onOpenPolicies={handleOpenPolicies}
        onLoginSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          if (updatedUser.role === 'driver') setActiveTab('driver');
          else if (updatedUser.role === 'admin') setActiveTab('admin');
        }}
      />

      <LegalPoliciesModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />

      <DownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          setCurrentUser(updated);
          try {
            localStorage.setItem('sawari_auth_user', JSON.stringify(updated));
          } catch {}
        }}
        initialTab={profileInitialTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          try {
            localStorage.removeItem('sawari_auth_user');
          } catch {}
          setCurrentUser(null);
        }}
      />

      <TripHistoryModal
        isOpen={isTripHistoryOpen}
        onClose={() => setIsTripHistoryOpen(false)}
        completedRides={completedRides}
        completedShipments={completedShipments}
        onOpenRating={handleOpenRating}
      />

      <RatingFeedbackModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal((prev) => ({ ...prev, isOpen: false }))}
        tripId={ratingModal.tripId}
        tripTitle={ratingModal.tripTitle}
        tripType={ratingModal.tripType}
      />

      <PaymentModal
        isOpen={paymentData.isOpen}
        onClose={() => setPaymentData((prev) => ({ ...prev, isOpen: false }))}
        amount={paymentData.amount}
        itemDescription={paymentData.description}
        referenceId={paymentData.referenceId}
        onPaymentComplete={handlePaymentSuccess}
      />

      {/* Global Voice Booking Modal */}
      <VoiceBookingModal
        isOpen={isGlobalVoiceModalOpen}
        onClose={() => setIsGlobalVoiceModalOpen(false)}
        onApplyVoiceBooking={(booking) => {
          setActiveTab('ride');
          setPendingVoiceBooking(booking);
          setIsGlobalVoiceModalOpen(false);
        }}
      />
    </div>
  );
}
