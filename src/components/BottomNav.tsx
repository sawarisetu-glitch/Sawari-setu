import React from 'react';
import {
  Car,
  Truck,
  UserCheck,
  ShieldCheck,
  History,
  User,
  FileCheck,
  Wallet,
  MapPin,
  LogIn,
} from 'lucide-react';
import { ServiceTab, UserProfile } from '../types';

interface BottomNavProps {
  activeTab: ServiceTab;
  onChangeTab: (tab: ServiceTab) => void;
  currentUser: UserProfile | null;
  activeRidesCount?: number;
  pendingKycCount?: number;
  onOpenTripHistory?: () => void;
  onOpenProfile?: () => void;
  onOpenDocumentUpload?: () => void;
  onOpenAuth?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  currentUser,
  activeRidesCount = 0,
  pendingKycCount = 2,
  onOpenTripHistory,
  onOpenProfile,
  onOpenDocumentUpload,
  onOpenAuth,
}) => {
  const role = currentUser?.role || 'passenger';

  // 1. CUSTOMER / PASSENGER TABS (Only Customer Options - NO Driver or Admin options)
  const customerTabs = [
    {
      id: 'ride',
      label: 'सवारी',
      sublabel: 'Rides',
      icon: Car,
      isActive: activeTab === 'ride',
      onClick: () => onChangeTab('ride'),
      badge: activeRidesCount > 0 ? `${activeRidesCount}` : undefined,
    },
    {
      id: 'logistics',
      label: 'माल',
      sublabel: 'Goods',
      icon: Truck,
      isActive: activeTab === 'logistics',
      onClick: () => onChangeTab('logistics'),
      badge: undefined,
    },
    {
      id: 'trips',
      label: 'मेरी यात्राएं',
      sublabel: 'History',
      icon: History,
      isActive: false,
      onClick: () => {
        if (currentUser) {
          onOpenTripHistory?.();
        } else {
          onOpenAuth?.();
        }
      },
      badge: undefined,
    },
    {
      id: 'profile',
      label: currentUser ? 'मेरी प्रोफाइल' : 'लॉगिन',
      sublabel: currentUser ? 'Profile' : 'Sign In',
      icon: currentUser ? User : LogIn,
      isActive: false,
      onClick: () => {
        if (currentUser) {
          onOpenProfile?.();
        } else {
          onOpenAuth?.();
        }
      },
      badge: undefined,
    },
  ];

  // 2. DRIVER TABS (Only Driver Options - NO Customer or Admin options)
  const driverTabs = [
    {
      id: 'driver_duty',
      label: 'चालक ड्यूटी',
      sublabel: 'Duty Hub',
      icon: UserCheck,
      isActive: activeTab === 'driver',
      onClick: () => onChangeTab('driver'),
      badge: 'Live',
    },
    {
      id: 'driver_docs',
      label: 'दस्तावेज KYC',
      sublabel: 'Documents',
      icon: FileCheck,
      isActive: false,
      onClick: () => onOpenDocumentUpload?.(),
      badge: undefined,
    },
    {
      id: 'driver_earnings',
      label: 'दैनिक कमाई',
      sublabel: 'Earnings',
      icon: Wallet,
      isActive: false,
      onClick: () => onChangeTab('driver'),
      badge: undefined,
    },
    {
      id: 'driver_profile',
      label: 'चालक प्रोफाइल',
      sublabel: 'Profile',
      icon: User,
      isActive: false,
      onClick: () => onOpenProfile?.(),
      badge: undefined,
    },
  ];

  // 3. ADMIN TABS (Only Master Admin Options - NO Customer or Driver options)
  const adminTabs = [
    {
      id: 'admin_hub',
      label: 'एडमिन हब',
      sublabel: 'Admin Hub',
      icon: ShieldCheck,
      isActive: activeTab === 'admin',
      onClick: () => onChangeTab('admin'),
      badge: pendingKycCount > 0 ? `${pendingKycCount}` : undefined,
    },
    {
      id: 'admin_fleet',
      label: 'फ्लीट मैप',
      sublabel: 'Live Fleet',
      icon: MapPin,
      isActive: false,
      onClick: () => onChangeTab('admin'),
      badge: undefined,
    },
    {
      id: 'admin_kyc',
      label: 'KYC सत्यापन',
      sublabel: 'Approvals',
      icon: FileCheck,
      isActive: false,
      onClick: () => onChangeTab('admin'),
      badge: undefined,
    },
    {
      id: 'admin_profile',
      label: 'एडमिन प्रोफाइल',
      sublabel: 'Settings',
      icon: User,
      isActive: false,
      onClick: () => onOpenProfile?.(),
      badge: undefined,
    },
  ];

  const tabsToRender =
    role === 'admin' ? adminTabs : role === 'driver' ? driverTabs : customerTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212]/95 backdrop-blur-lg border-t border-zinc-800 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]">
      <div className="max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabsToRender.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isActive;

          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 select-none cursor-pointer ${
                isActive
                  ? 'text-[#FF8C00] font-bold scale-105'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              {/* Active glow top highlight */}
              {isActive && (
                <div className="absolute -top-1.5 w-8 h-1 rounded-full bg-[#FF8C00] shadow-[0_0_8px_#FF8C00]" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#FF8C00]/15 text-[#FF8C00]'
                      : 'bg-transparent text-zinc-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${
                      tab.badge === 'Live'
                        ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse'
                        : 'bg-[#FF8C00] text-black border-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Hindi & English Label */}
              <div className="flex flex-col items-center leading-none mt-0.5">
                <span className="text-xs">{tab.label}</span>
                <span className="text-[9px] text-zinc-500 font-normal mt-0.5">
                  {tab.sublabel}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
