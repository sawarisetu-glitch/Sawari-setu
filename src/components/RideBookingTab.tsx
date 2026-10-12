import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Car,
  Bike,
  Users,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  PhoneCall,
  Clock,
  Sparkles,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  Info,
  CloudRain,
  Moon,
  Shield,
  Layers,
  Zap,
  Mic,
  User,
  MessageCircle,
  Calendar,
  Repeat,
  Split,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RideMode, RideBooking, LiveVehicle, UserProfile, LiveTrafficInfo } from '../types';
import { LiveMap } from './LiveMap';
import { POPULAR_LOCATIONS } from '../utils/storage';
import { IndianVehicleBadge } from './IndianVehicleBadge';
import { generateBookingReceiptPdf } from '../utils/pdfGenerator';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import {
  calculateRouteAndDistance,
  calculateHaversineDistanceKm,
  reverseGeocodeCoords,
} from '../utils/googleMapsService';
import {
  calculateMasterFare,
  isCurrentlyNightHours,
  MASTER_VEHICLE_CONFIGS,
} from '../utils/fareEngine';
import confetti from 'canvas-confetti';
import { InvoiceSuccessModal } from './InvoiceSuccessModal';
import { VoiceBookingModal } from './VoiceBookingModal';
import { WhatsAppBookingModal } from './WhatsAppBookingModal';

interface RideBookingTabProps {
  currentUser: UserProfile | null;
  vehicles: LiveVehicle[];
  activeRide: RideBooking | null;
  setActiveRide: (ride: RideBooking | null) => void;
  onOpenPayment: (amount: number, desc: string, ref: string) => void;
  onOpenSos: () => void;
  onTripCompleted?: (ride: RideBooking) => void;
  onRequireAuth?: () => void;
  initialVoiceBooking?: {
    pickup: string;
    destination: string;
    mode: RideMode;
    transcript?: string;
    directConfirm?: boolean;
  } | null;
  onClearInitialVoiceBooking?: () => void;
}

export const RideBookingTab: React.FC<RideBookingTabProps> = ({
  currentUser,
  vehicles,
  activeRide,
  setActiveRide,
  onOpenPayment,
  onOpenSos,
  onTripCompleted,
  onRequireAuth,
  initialVoiceBooking,
  onClearInitialVoiceBooking,
}) => {
  const [passengerName, setPassengerName] = useState(currentUser?.name || '');
  const [passengerPhone, setPassengerPhone] = useState(currentUser?.phone || '');
  const [pickup, setPickup] = useState('दशमी का बाग, सिरसा टाउन, प्रयागराज - 212305');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({ lat: 25.2642, lng: 82.0912 });
  const [destination, setDestination] = useState('उरवा ब्लॉक व बाजार, प्रयागराज');

  useEffect(() => {
    if (currentUser) {
      setPassengerName(currentUser.name || '');
      setPassengerPhone(currentUser.phone || '');
    } else {
      setPassengerName('');
      setPassengerPhone('');
    }
  }, [currentUser]);
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 25.2289, lng: 82.0395 });
  const [distanceKm, setDistanceKm] = useState(7.5);
  const [selectedMode, setSelectedMode] = useState<RideMode>('bike');
  const [hasBadWeather, setHasBadWeather] = useState(false);
  const [isNightHours, setIsNightHours] = useState(() => isCurrentlyNightHours());
  const [isInitial6Months, setIsInitial6Months] = useState(true);
  const [agreedToSafety, setAgreedToSafety] = useState(true);
  const [rideStarted, setRideStarted] = useState(false);
  const [completedRideModal, setCompletedRideModal] = useState<RideBooking | null>(null);

  // New High-Impact Feature States:
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [showOptionsDrawer, setShowOptionsDrawer] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [scheduledTime, setScheduledTime] = useState('06:30 AM');
  const [isOutstation, setIsOutstation] = useState(false);
  const [outstationType, setOutstationType] = useState<'one_way' | 'round_trip'>('one_way');
  const [isReturnTripDiscount, setIsReturnTripDiscount] = useState(false);
  const [bookedViaChannel, setBookedViaChannel] = useState<'app' | 'voice' | 'whatsapp'>('app');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_primary');
  const [currentTrafficInfo, setCurrentTrafficInfo] = useState<LiveTrafficInfo | null>(null);

  // Watch for external voice booking inputs (e.g. from Header or global Mic)
  useEffect(() => {
    if (initialVoiceBooking) {
      if (initialVoiceBooking.pickup) setPickup(initialVoiceBooking.pickup);
      if (initialVoiceBooking.destination) setDestination(initialVoiceBooking.destination);
      if (initialVoiceBooking.mode) setSelectedMode(initialVoiceBooking.mode);
      setBookedViaChannel('voice');
      if (initialVoiceBooking.directConfirm) {
        setTimeout(() => {
          handleBookRide();
        }, 300);
      }
      onClearInitialVoiceBooking?.();
    }
  }, [initialVoiceBooking]);

  // Recalculate route whenever coordinates update
  const handleUpdateCoords = async (
    newPickup: { lat: number; lng: number },
    newDest: { lat: number; lng: number }
  ) => {
    try {
      const res = await calculateRouteAndDistance(newPickup, newDest);
      setDistanceKm(res.distanceKm);
    } catch {
      const dist = calculateHaversineDistanceKm(newPickup, newDest);
      setDistanceKm(dist);
    }
  };

  // Vehicle service modes matching Master Fare Structure:
  const rideModesConfig: {
    id: RideMode;
    title: string;
    subtext: string;
    icon: any;
    capacity: string;
    tag?: string;
  }[] = [
    {
      id: 'bike',
      title: 'मोटरसाइकिल (Bike Taxi)',
      subtext: '0-2 किमी ₹50 • फिर ₹10/किमी (मैक्स 40 किमी)',
      icon: Bike,
      capacity: '1 सवारी',
      tag: 'सुपर फास्ट',
    },
    {
      id: 'erickshaw_share',
      title: 'ई-रिक्शा शेयर (Share)',
      subtext: '4-5 किमी तक ₹20/सवारी फिक्स (मैक्स 20 किमी)',
      icon: Users,
      capacity: 'प्रति सीट',
      tag: 'शेयरिंग मोड',
    },
    {
      id: 'erickshaw_direct',
      title: 'ई-रिक्शा डायरेक्ट (Full)',
      subtext: 'बेस ₹25 + ₹10/किमी डायरेक्ट (मैक्स 20 किमी)',
      icon: Car,
      capacity: '4 सवारी',
      tag: 'डायरेक्ट फुल बुक',
    },
    {
      id: 'auto',
      title: 'ऑटो रिक्शा (Auto)',
      subtext: 'बेस ₹30 + ₹13/किमी (न्यूनतम ₹45)',
      icon: Car,
      capacity: '3 सवारी',
      tag: 'केवल डायरेक्ट',
    },
    {
      id: 'car_4_5',
      title: '4 व 5 सीटर कार (Mini / Sedan)',
      subtext: 'बेस ₹200 (टोल शामिल) • स्लैब ₹40 / ₹35 / ₹30',
      icon: Car,
      capacity: '4-5 सवारी AC',
      tag: 'टोल टैक्स शामिल',
    },
    {
      id: 'car_6_7',
      title: '6 व 7 सीटर SUV (SUV / MUV)',
      subtext: 'बेस ₹200 (टोल शामिल) • स्लैब ₹40 / ₹35',
      icon: Car,
      capacity: '6-7 सवारी AC',
      tag: 'टोल टैक्स शामिल',
    },
  ];

  // Effective distance considering round-trip outstation:
  const effectiveDistanceKm =
    isOutstation && outstationType === 'round_trip'
      ? Math.round(distanceKm * 2 * 10) / 10
      : distanceKm;

  // Dynamic Master Fare calculation
  const currentFareResult = calculateMasterFare({
    distanceKm: effectiveDistanceKm,
    mode: selectedMode,
    hasBadWeather,
    isNightHours,
    isInitial6Months,
    isReturnTripDiscount,
    isOutstation,
    outstationType,
  });
  const calculatedFare = currentFareResult.totalFare;

  const handleBookRide = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    if (!agreedToSafety) {
      alert('कृपया सुरक्षा नियमों से सहमति प्रदान करें।');
      return;
    }

    if (!currentFareResult.isDistanceAllowed) {
      alert(currentFareResult.distanceWarning || 'यह दूरी चयनित वाहन के लिए मान्य नहीं है।');
      return;
    }

    const assignedDriver =
      vehicles.find((v) => {
        if (v.type !== 'passenger') return false;
        if (selectedMode === 'bike') return v.subType === 'bike';
        if (selectedMode === 'auto') return v.subType === 'auto';
        if (selectedMode === 'erickshaw_share' || selectedMode === 'erickshaw_direct' || selectedMode === 'erickshaw') return v.subType === 'erickshaw';
        if (selectedMode === 'car_4_5' || selectedMode === 'car_6_7' || selectedMode === 'minicar') return v.subType === 'minicar' || v.subType === 'direct';
        return v.subType === selectedMode;
      }) ||
      vehicles.find((v) => v.type === 'passenger') ||
      vehicles[0];

    const newBooking: RideBooking = {
      id: `RIDE_SS_${Math.floor(10000 + Math.random() * 90000)}`,
      passengerName,
      passengerPhone,
      pickup,
      pickupCoords: pickupCoords,
      destination,
      destCoords: destCoords,
      mode: selectedMode,
      distanceKm: effectiveDistanceKm,
      baseFare: currentFareResult.baseFare,
      totalFare: currentFareResult.totalFare,
      weatherSurge: currentFareResult.weatherSurge,
      nightSurge: currentFareResult.nightSurge,
      tollTaxIncluded: true,
      driverEarningShare: currentFareResult.driverShare,
      commissionDeduction: currentFareResult.companyDeduction,
      isInitial6Months: currentFareResult.isInitial6Months,
      fareBreakdownText: currentFareResult.explanationText,
      isScheduled,
      scheduledDate: isScheduled ? scheduledDate : undefined,
      scheduledTime: isScheduled ? scheduledTime : undefined,
      isOutstation,
      outstationType: isOutstation ? outstationType : undefined,
      isReturnTripDiscount,
      returnTripDiscountAmount: currentFareResult.returnTripDiscountAmount,
      bookedViaVoice: bookedViaChannel === 'voice',
      bookedViaWhatsApp: bookedViaChannel === 'whatsapp',
      status: 'assigned',
      otp: `${Math.floor(1000 + Math.random() * 9000)}`,
      driverId: assignedDriver.id,
      driverName: assignedDriver.driverName,
      driverPhone: assignedDriver.phone,
      driverRating: assignedDriver.rating,
      vehicleNumber: assignedDriver.vehicleNumber,
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'upi',
      paymentStatus: 'pending',
      agreedToSafety: true,
    };

    setActiveRide(newBooking);
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Live Satellite / Vector Map with Realtime Moving Cabs */}
      <div className="relative">
        <LiveMap
          vehicles={vehicles}
          showPassengerLayer={true}
          showLogisticsLayer={false}
          pickupCoords={activeRide ? activeRide.pickupCoords : pickupCoords}
          destCoords={activeRide ? activeRide.destCoords : destCoords}
          pickupLabel={activeRide ? activeRide.pickup : pickup}
          destLabel={activeRide ? activeRide.destination : destination}
          heightClass="h-[250px] sm:h-[300px]"
          tripType="ride"
          activeTripId={activeRide?.id}
          activeRide={activeRide}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(route) => setSelectedRouteId(route.id)}
          onTrafficDataLoaded={(traffic) => setCurrentTrafficInfo(traffic)}
          onLocateUser={() => {
            if ('geolocation' in navigator) {
              navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setPickupCoords({ lat, lng });
                handleUpdateCoords({ lat, lng }, destCoords);
                try {
                  const { address } = await reverseGeocodeCoords(lat, lng);
                  setPickup(address);
                } catch {
                  setPickup(`लाइव जीपीएस (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                }
              });
            } else {
              setPickup('दशमी का बाग, सिरसा टाउन, प्रयागराज - 212305');
              const defaultCoords = { lat: 25.2642, lng: 82.0912 };
              setPickupCoords(defaultCoords);
              handleUpdateCoords(defaultCoords, destCoords);
            }
          }}
        />
      </div>

      {/* Active Ride Floating Status Card (If ride is active) */}
      {activeRide ? (
        <div className="p-4 rounded-3xl bg-zinc-900 border-2 border-amber-500/80 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                लाइव सवारी सक्रिय (RIDE IN PROGRESS)
              </span>
              <h3 className="text-base font-extrabold text-white">सवारी ID: {activeRide.id}</h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">सवारी शुरू OTP:</span>
              <span className="text-xl font-mono font-black text-[#FF8C00] bg-black/60 px-2 py-0.5 rounded-lg border border-amber-500/40">
                {activeRide.otp}
              </span>
            </div>
          </div>

          {/* Assigned Driver & Vehicle Details */}
          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IndianVehicleBadge vehicleType={activeRide.mode} size="md" showBorder={true} />
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {activeRide.driverName}
                  <span className="text-[10px] text-amber-400">★ {activeRide.driverRating}</span>
                </h4>
                <p className="text-xs font-mono text-zinc-300 font-bold">
                  {activeRide.vehicleNumber}
                </p>
                <p className="text-[10px] text-amber-400/90 font-medium">मोड: {activeRide.mode.toUpperCase()}</p>
              </div>
            </div>

            <a
              href={`tel:${activeRide.driverPhone || '9450985355'}`}
              className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span>कॉल</span>
            </a>
          </div>

          {/* Route Summary */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">पिकअप: {activeRide.pickup}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <Navigation className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="truncate">गंतव्य: {activeRide.destination}</span>
            </div>
          </div>

          {/* Live Traffic Conditions & Route Advisory */}
          {currentTrafficInfo && (
            <div className="p-3 bg-zinc-950/90 rounded-2xl border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: currentTrafficInfo.statusBadgeColor }}
                  />
                  <span>लाइव ट्रैफिक: {currentTrafficInfo.statusLabelHindi}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  गति: {currentTrafficInfo.averageSpeedKmH} km/h •{' '}
                  {currentTrafficInfo.delayMins > 0 ? `+${currentTrafficInfo.delayMins}m विलंब` : 'समय पर'}
                </span>
              </div>

              {/* Alternative Bypass Route Selector for Driver & Rider */}
              {currentTrafficInfo.alternativeRoutes?.find((r) => r.id === 'route_bypass') && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-750 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Split className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate text-zinc-300">
                      {selectedRouteId === 'route_bypass' ? (
                        <strong className="text-emerald-400">
                          ✓ तेज आउटर बाईपास रूट सक्रिय (मैप पर प्रदर्शित)
                        </strong>
                      ) : (
                        <span>
                          वैकल्पिक तेज बाईपास:{' '}
                          <strong className="text-emerald-400">
                            {currentTrafficInfo.alternativeRoutes.find((r) => r.id === 'route_bypass')?.timeSavingsMins} मिनट की बचत
                          </strong>
                        </span>
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRouteId((prev) => (prev === 'route_bypass' ? 'route_primary' : 'route_bypass'))
                    }
                    className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all shrink-0 ${
                      selectedRouteId === 'route_bypass'
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-md shadow-emerald-500/20'
                    }`}
                  >
                    {selectedRouteId === 'route_bypass' ? 'मुख्य मार्ग चुनें' : 'बाईपास चुनें ⚡'}
                  </button>
                </div>
              )}

              {currentTrafficInfo.recommendation && (
                <p className="text-[11px] text-amber-300/90 leading-tight">
                  💡 {currentTrafficInfo.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons: PDF Receipt, Online Pay, SOS, Complete */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Download PDF Receipt Button */}
            <button
              onClick={() => generateBookingReceiptPdf(activeRide)}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all shadow-md"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>PDF रसीद डाउनलोड</span>
            </button>

            {/* Pay Button */}
            <button
              onClick={() =>
                onOpenPayment(activeRide.totalFare, `सवारी किराया (${activeRide.mode})`, activeRide.id)
              }
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all shadow-md ${
                activeRide.paymentStatus === 'paid'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#FF8C00] text-black border-amber-300 hover:bg-orange-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {activeRide.paymentStatus === 'paid'
                  ? '✓ भुगतान हो चुका'
                  : `₹${activeRide.totalFare} भुगतान करें`}
              </span>
            </button>
          </div>

          {/* End Ride Button */}
          <div className="pt-2 border-t border-zinc-800 flex gap-2">
            <button
              onClick={onOpenSos}
              className="py-2 px-3 rounded-xl bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold flex items-center justify-center gap-1"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>SOS सहायता</span>
            </button>

            <button
              onClick={() => {
                const finishedRide: RideBooking = {
                  ...activeRide,
                  status: 'completed',
                  paymentStatus: 'paid',
                  completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  createdAt: new Date().toLocaleDateString('hi-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                };
                // Automatically generate and download the PDF invoice!
                generateBookingReceiptPdf(finishedRide);
                // Call completion callback to save in trip history
                onTripCompleted?.(finishedRide);
                // Clear active ride
                setActiveRide(null);
                // Open celebration modal
                setCompletedRideModal(finishedRide);
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              }}
              className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              सवारी पूरी करें व अंतिम इनवॉइस पाएं
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        /* Booking Form */
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
          {/* Card Top: Title & Quick Shortcuts */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                  सवारी बुक करें (Book Ride)
                </h2>
                <p className="text-[10px] text-zinc-400">तुरंत नजदीकी कैब, ऑटो व बाइक उपलब्ध</p>
              </div>
            </div>

            {/* Quick Action Pills: Voice & WhatsApp */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 group"
                title="बोलकर बुकिंग करें"
              >
                <Mic className="w-3.5 h-3.5 text-[#FF8C00] group-hover:scale-110 transition-transform" />
                <span>बोलकर</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 group"
                title="व्हाट्सएप पर बुक करें"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Guest / Unauthenticated Notice Banner */}
          {!currentUser && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-zinc-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF8C00] text-black">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">सवारी बुक करने हेतु खाता अनिवार्य है</h4>
                  <p className="text-[10px] text-zinc-400">सुरक्षित OTP सत्यापन द्वारा लॉगिन या नया खाता बनाएं</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-3 py-1.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs shrink-0 cursor-pointer shadow-sm active:scale-95"
              >
                लॉगिन करें
              </button>
            </div>
          )}

          {/* Location Box: Pickup & Destination with GPS */}
          <div className="p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800/90 space-y-2.5">
            <LocationAutocompleteInput
              label="पिकअप स्थान (Pickup Location)"
              value={pickup}
              onChange={setPickup}
              onSelectCoords={(coords, addr) => {
                setPickupCoords(coords);
                setPickup(addr);
                handleUpdateCoords(coords, destCoords);
              }}
              placeholder="पिकअप का पता या लैंडमार्क खोजें..."
              isPickup={true}
              showGpsButton={true}
              currentLocationCoords={pickupCoords}
            />

            <LocationAutocompleteInput
              label="कहाँ जाना है? (Destination)"
              value={destination}
              onChange={setDestination}
              onSelectCoords={(coords, addr) => {
                setDestCoords(coords);
                setDestination(addr);
                handleUpdateCoords(pickupCoords, coords);
              }}
              placeholder="गंतव्य का पता या शहर खोजें..."
              isPickup={false}
              showGpsButton={false}
              currentLocationCoords={pickupCoords}
            />

            {/* Quick Route Distance & Time Badge */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                <Navigation className="w-3 h-3 text-[#FF8C00]" />
                <span>दूरी: <strong className="text-amber-400">{distanceKm} किमी</strong></span>
                <span className="text-zinc-600">•</span>
                <span>अनुमानित समय: ~{Math.round(distanceKm * 2.2 + 3)} मिनट</span>
              </span>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500">दूरी बदलें:</span>
                <input
                  type="number"
                  min="1"
                  max="150"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                  className="w-14 bg-zinc-950 border border-zinc-700 text-center font-bold text-amber-400 rounded-lg py-0.5 px-1 text-xs focus:outline-none focus:border-[#FF8C00]"
                />
                <span className="text-[10px] text-zinc-500">किमी</span>
              </div>
            </div>
          </div>

          {/* Quick Segmented Controls: Local/Outstation & Now/Schedule */}
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <div className="flex rounded-xl bg-zinc-900 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsOutstation(false);
                  setOutstationType('one_way');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  !isOutstation
                    ? 'bg-[#FF8C00] text-black font-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                लोकल
              </button>
              <button
                type="button"
                onClick={() => setIsOutstation(true)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  isOutstation
                    ? 'bg-[#FF8C00] text-black font-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                आउटस्टेशन
              </button>
            </div>

            <div className="flex rounded-xl bg-zinc-900 p-0.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setIsScheduled(false)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  !isScheduled
                    ? 'bg-zinc-800 text-white font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                अभी
              </button>
              <button
                type="button"
                onClick={() => setIsScheduled(true)}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  isScheduled
                    ? 'bg-amber-500/25 text-[#FF8C00] font-bold border border-amber-500/50'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                शेड्यूल
              </button>
            </div>
          </div>

          {/* Outstation options if active */}
          {isOutstation && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
              <button
                type="button"
                onClick={() => setOutstationType('one_way')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                  outstationType === 'one_way'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-950 text-zinc-500 border-zinc-850'
                }`}
              >
                वन-वे ({distanceKm} किमी)
              </button>
              <button
                type="button"
                onClick={() => setOutstationType('round_trip')}
                className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                  outstationType === 'round_trip'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-950 text-zinc-500 border-zinc-850'
                }`}
              >
                राउंड ट्रिप ({Math.round(distanceKm * 2)} किमी)
              </button>
            </div>
          )}

          {/* Scheduled Date/Time if active */}
          {isScheduled && (
            <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs">
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">दिनांक:</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-400 block mb-0.5">समय:</label>
                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  placeholder="06:30 AM"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>
            </div>
          )}

          {/* Choose Vehicle (गाड़ी चुनें) - Clean App Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">गाड़ी चुनें (Select Ride):</span>
              <span className="text-[10px] text-emerald-400 font-medium">टोल टैक्स शामिल • 0% छुपा शुल्क</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {rideModesConfig.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;
                const modeFareRes = calculateMasterFare({
                  distanceKm: effectiveDistanceKm,
                  mode: mode.id,
                  hasBadWeather,
                  isNightHours,
                  isInitial6Months,
                  isReturnTripDiscount,
                  isOutstation,
                  outstationType,
                });
                const isOverLimit = !modeFareRes.isDistanceAllowed;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative p-2.5 rounded-2xl border text-left transition-all group overflow-hidden ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : isOverLimit
                        ? 'bg-zinc-950/70 border-red-900/50 opacity-60'
                        : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {mode.tag && (
                      <span className="absolute top-1.5 right-1.5 text-[8.5px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                        {mode.tag}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <IndianVehicleBadge
                        vehicleType={mode.id}
                        size="md"
                        showBorder={isSelected}
                        className={`transition-transform duration-200 group-hover:scale-105 ${
                          isSelected ? 'border-amber-400 ring-1 ring-amber-400' : ''
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-black text-[#FF8C00] block">
                          ₹{modeFareRes.totalFare}
                        </span>
                        <span className="text-[9px] text-zinc-400 block font-mono">~3 मिनट पिकअप</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white truncate">{mode.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span>{mode.capacity}</span>
                      <span className="text-[9px] text-emerald-400 font-medium">टोल शामिल</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Over-Limit Distance Alert (If selected mode violates distance rules) */}
          {!currentFareResult.isDistanceAllowed && (
            <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{currentFareResult.distanceWarning}</span>
            </div>
          )}

          {/* Collapsible Additional Options & Fare Breakdown */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOptionsDrawer(!showOptionsDrawer)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>अतिरिक्त विकल्प व विस्तृत किराया विवरण</span>
              </span>
              {showOptionsDrawer ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {showOptionsDrawer && (
              <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-zinc-800/60 text-xs animate-in fade-in">
                {/* 1. Surges & Savings toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Weather */}
                  <button
                    type="button"
                    onClick={() => setHasBadWeather(!hasBadWeather)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      hasBadWeather
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <CloudRain className="w-3.5 h-3.5" />
                      <span>बारिश मौसम</span>
                    </span>
                    <span className="text-[10px] font-bold">{hasBadWeather ? '+₹200' : 'ऑफ'}</span>
                  </button>

                  {/* Night */}
                  <button
                    type="button"
                    onClick={() => setIsNightHours(!isNightHours)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      isNightHours
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Moon className="w-3.5 h-3.5" />
                      <span>नाइट आवर्स</span>
                    </span>
                    <span className="text-[10px] font-bold">{isNightHours ? '+₹200' : 'डे'}</span>
                  </button>

                  {/* Return trip discount */}
                  <button
                    type="button"
                    onClick={() => setIsReturnTripDiscount(!isReturnTripDiscount)}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      isReturnTripDiscount
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-[11px]">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>वापसी छूट</span>
                    </span>
                    <span className="text-[10px] font-bold">{isReturnTripDiscount ? '40% OFF' : 'सामान्य'}</span>
                  </button>
                </div>

                {/* 2. Passenger contact info */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">सवार का नाम</label>
                    <input
                      type="text"
                      value={passengerName}
                      onChange={(e) => setPassengerName(e.target.value)}
                      placeholder="नाम"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FF8C00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-400 mb-0.5">मोबाइल नंबर</label>
                    <input
                      type="tel"
                      value={passengerPhone}
                      onChange={(e) => setPassengerPhone(e.target.value)}
                      placeholder="मोबाइल"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FF8C00]"
                    />
                  </div>
                </div>

                {/* 3. Detailed Slabs Breakdown */}
                <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800/80 space-y-1 text-[11px] text-zinc-400">
                  <div className="flex items-center justify-between text-zinc-200 font-bold mb-1">
                    <span>किराया विवरण ({currentFareResult.modeTitle})</span>
                    <span>दूरी: {effectiveDistanceKm} किमी</span>
                  </div>
                  {currentFareResult.slabBreakdown.map((slab, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span>• {slab.label}:</span>
                      <span className="font-medium text-zinc-300">₹{slab.amount}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between text-emerald-400 font-semibold pt-1 border-t border-zinc-800/60">
                    <span>टोल व बीमा: शामिल</span>
                    <span>ड्राइवर शेयर: ₹{currentFareResult.driverShare} (100%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety disclaimer */}
          <div className="flex items-center gap-2 px-1 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>हेलमेट/सीटबेल्ट व पारगमन सुरक्षा बीमा शामिल है।</span>
          </div>

          {/* Big Orange Action Button */}
          <button
            type="button"
            onClick={handleBookRide}
            disabled={!currentFareResult.isDistanceAllowed}
            className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base tracking-wide transition-all shadow-xl flex items-center justify-center gap-2 active:scale-98 cursor-pointer ${
              !currentFareResult.isDistanceAllowed
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                : 'bg-[#FF8C00] hover:bg-orange-600 text-black shadow-amber-500/25'
            }`}
          >
            <span>
              {!currentFareResult.isDistanceAllowed
                ? 'दूरी सीमा पार (कृपया दूसरा वाहन चुनें)'
                : `सवारी बुक करें • ₹${calculatedFare}`}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Automatic Invoice Generated Success Modal */}
      <InvoiceSuccessModal
        isOpen={!!completedRideModal}
        onClose={() => setCompletedRideModal(null)}
        tripType="ride"
        rideData={completedRideModal}
      />

      {/* 1. Voice Booking Modal */}
      <VoiceBookingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onApplyVoiceBooking={({ pickup: p, destination: d, mode: m, directConfirm }) => {
          setPickup(p);
          setDestination(d);
          setSelectedMode(m);
          setBookedViaChannel('voice');
          setIsVoiceModalOpen(false);

          if (directConfirm) {
            setTimeout(() => {
              handleBookRide();
            }, 150);
          }
        }}
      />

      {/* 2. WhatsApp Direct Bot Modal */}
      <WhatsAppBookingModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        bookingDetails={{
          passengerName,
          passengerPhone,
          pickup,
          destination,
          mode: selectedMode,
          modeTitle: currentFareResult.modeTitle,
          distanceKm: effectiveDistanceKm,
          totalFare: calculatedFare,
          isScheduled,
          scheduledDate: isScheduled ? scheduledDate : undefined,
          scheduledTime: isScheduled ? scheduledTime : undefined,
          isOutstation,
          isReturnTripDiscount,
        }}
      />
    </div>
  );
};
