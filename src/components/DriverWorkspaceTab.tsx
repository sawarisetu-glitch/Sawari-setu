import React, { useState } from 'react';
import {
  Power,
  TrendingUp,
  Car,
  Truck,
  Award,
  ShieldCheck,
  FileText,
  FileDown,
  CheckCircle2,
  Bell,
  Clock,
  Sparkles,
  PhoneCall,
  Navigation,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Upload,
} from 'lucide-react';
import { DigitalSlip, UserProfile, RideBooking } from '../types';
import { generateDriverDigitalSlipPdf } from '../utils/pdfGenerator';
import { DriverEarningsChart } from './DriverEarningsChart';
import confetti from 'canvas-confetti';

interface DriverWorkspaceTabProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  completedRidesList?: RideBooking[];
  onOpenDocumentUpload?: () => void;
}

export const DriverWorkspaceTab: React.FC<DriverWorkspaceTabProps> = ({
  currentUser,
  onOpenAuth,
  completedRidesList = [],
  onOpenDocumentUpload,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [todayEarnings, setTodayEarnings] = useState(1850);
  const [completedRides, setCompletedRides] = useState(8);
  const [goodsJobs, setGoodsJobs] = useState(3);
  const [incomingOrder, setIncomingOrder] = useState<{
    id: string;
    type: 'ride' | 'goods';
    title: string;
    pickup: string;
    drop: string;
    fare: number;
    distance: number;
  } | null>({
    id: 'TRIP_REQ_8819',
    type: 'ride',
    title: 'सवारी अनुरोध • ऑटो रिक्शा (Auto)',
    pickup: 'हजरतगंज चौराहा, निकट बैंक ऑफ बड़ौदा',
    drop: 'चारबाग रेलवे स्टेशन प्लेटफॉर्म 1',
    fare: 180,
    distance: 5.2,
  });

  const [lastGeneratedSlip, setLastGeneratedSlip] = useState<DigitalSlip | null>(null);
  const [isInitial6Months, setIsInitial6Months] = useState(true);

  // Generate Digital Driver Slip / Notepad Stamp
  const handleGenerateDigitalSlip = (tripFare: number, distance: number) => {
    const slipId = `SLIP_${Math.floor(10000 + Math.random() * 90000)}`;
    const driverShare = isInitial6Months ? tripFare : Math.round(tripFare * 0.85);
    const platformFee = isInitial6Months ? 0 : Math.round(tripFare * 0.15);

    const slip: DigitalSlip = {
      slipId,
      tripId: `TRIP_SS_${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: currentUser?.name || 'सुरेश कुमार (चालक)',
      driverId: 'SS-DRV-4421',
      vehicleNumber: 'UP32-AK-4421',
      pickup: 'हजरतगंज चौराहा, लखनऊ',
      drop: 'चारबाग रेलवे स्टेशन, लखनऊ',
      distanceKm: distance,
      grossAmount: tripFare,
      driverShare,
      platformFee,
      paymentMode: 'UPI / Online (Settled)',
      timestamp: new Date().toLocaleString('en-IN'),
      stampSignature: 'SEAL_SS_9450_AUTH',
    };

    setLastGeneratedSlip(slip);
    generateDriverDigitalSlipPdf(slip);
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
  };

  const handleAcceptOrder = () => {
    if (!incomingOrder) return;
    const fare = incomingOrder.fare;
    const distance = incomingOrder.distance;
    const driverEarning = isInitial6Months ? fare : Math.round(fare * 0.85);
    setTodayEarnings((e) => e + driverEarning);
    if (incomingOrder.type === 'ride') {
      setCompletedRides((r) => r + 1);
      // Persist newly accepted completed ride into storage so D3 earnings chart updates live
      const newRide: RideBooking = {
        id: `RIDE_DRV_${Math.floor(1000 + Math.random() * 9000)}`,
        passengerName: 'यात्री (ऑनलाइन बुकिंग)',
        passengerPhone: '9450985355',
        pickup: incomingOrder.pickup,
        pickupCoords: { lat: 26.8467, lng: 80.9462 },
        destination: incomingOrder.drop,
        destCoords: { lat: 26.8532, lng: 80.9982 },
        mode: 'auto',
        distanceKm: distance,
        baseFare: 40,
        totalFare: fare,
        status: 'completed',
        driverName: currentUser?.name || 'सुरेश कुमार (चालक)',
        driverPhone: '9450985355',
        vehicleNumber: 'UP32-AK-4421',
        paymentStatus: 'paid',
        bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        paymentMethod: 'upi',
        otp: '4489',
        agreedToSafety: true,
        createdAt: new Date().toISOString(),
      };
      try {
        const raw = localStorage.getItem('sawari_completed_rides');
        const list: RideBooking[] = raw ? JSON.parse(raw) : [];
        list.unshift(newRide);
        localStorage.setItem('sawari_completed_rides', JSON.stringify(list));
        window.dispatchEvent(new Event('storage'));
      } catch {}
    } else {
      setGoodsJobs((g) => g + 1);
    }
    handleGenerateDigitalSlip(fare, distance);
    setIncomingOrder(null);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Unauthenticated Driver Notice */}
      {!currentUser && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-zinc-900 border border-amber-500/40 flex items-center justify-between gap-3 shadow-md">
          <div>
            <h4 className="text-xs font-black text-white">ड्राइवर पार्टनर लॉगिन आवश्यक</h4>
            <p className="text-[10px] text-zinc-400">ड्यूटी शुरू करने, सवारी स्वीकार करने व दैनिक कमाई देखने के लिए लॉगिन करें</p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-3.5 py-1.5 rounded-xl bg-[#FF8C00] text-black font-black text-xs hover:bg-orange-600 transition-all cursor-pointer shadow-sm shrink-0"
          >
            पार्टनर लॉगिन
          </button>
        </div>
      )}

      {/* Driver Workspace Header Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center font-black text-xl border border-amber-500/40">
              {currentUser?.name ? currentUser.name[0] : 'ड'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {currentUser?.name || 'ड्राइवर पार्टनर'}
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  RTO सत्यापित
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {currentUser?.phone ? `मोबाइल: +91 ${currentUser.phone}` : 'आईडी: SS-DRV-4421'}
              </p>
            </div>
          </div>

          {/* Online/Offline Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl font-black text-xs transition-all shadow-md active:scale-95 border ${
              isOnline
                ? 'bg-emerald-500 text-black border-emerald-400 shadow-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'ऑनलाइन (Online)' : 'ऑफलाइन (Offline)'}</span>
          </button>
        </div>

        {/* Live Status Pulse */}
        <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-800/80">
          <span className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-ping' : 'bg-zinc-600'
              }`}
            />
            {isOnline
              ? 'आप ऑनलाइन हैं - सवारी व माल रिक्वेस्ट प्राप्त करने हेतु तैयार'
              : 'आप ऑफलाइन हैं - नई बुकिंग प्राप्त करने के लिए ऑनलाइन टॉगल करें'}
          </span>
          <span className="text-amber-400 font-bold">रेटिंग: ★ 4.9</span>
        </div>

        {/* Snapshot Dashboard Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Today's Earnings */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">आज की कुल कमाई</span>
            <span className="text-xl font-black text-[#FF8C00]">₹{todayEarnings}</span>
            <span className="text-[10px] text-emerald-400 block font-medium mt-0.5">दैनिक भुगतान चालू</span>
          </div>

          {/* Active Rides Done */}
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">पूर्ण सवारी</span>
            <span className="text-xl font-black text-white">{completedRides} ट्रिप्स</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">बाइक / ऑटो कैब</span>
          </div>

          {/* Goods Jobs */}
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">माल ढुलाई ट्रिप</span>
            <span className="text-xl font-black text-cyan-400">{goodsJobs} जॉब्स</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">छोटा हाथी / लोडर</span>
          </div>

          {/* Acceptance Rate */}
          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">स्वीकृति दर</span>
            <span className="text-xl font-black text-emerald-400">96.4%</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5">टॉप ड्राइवर क्लब</span>
          </div>
        </div>

        {/* Master Fare & Commission Policy Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border border-amber-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-white flex items-center gap-1.5">
              <span className="p-1 rounded-lg bg-amber-500/20 text-[#FF8C00]">📜</span>
              <span>मास्टर संचालन एवं 0% कमीशन नीति (Master Fare Policy)</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
              0% कमीशन सक्रिय (100% कमाई)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300">
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
              <strong className="text-amber-400 block mb-0.5">1. कमीशन नीति:</strong>
              शुरुआती 6 महीने कंपनी मार्जिन <strong>0%</strong> रहेगा (100% पैसा ड्राइवर को)। 6 माह बाद 15% प्लेटफॉर्म डिडक्शन व 85% ड्राइवर शेयर।
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
              <strong className="text-emerald-400 block mb-0.5">2. टोल टैक्स (Toll Tax):</strong>
              रूट पर पड़ने वाला टोल टैक्स कुल किराए में ही शामिल है। ग्राहक से कोई टोल अलग से नहीं लिया जाता।
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
              <strong className="text-blue-400 block mb-0.5">3. खराब मौसम सर्ज चार्ज:</strong>
              बारिश या खराब मौसम में सीधे <strong>+₹200</strong> अतिरिक्त जुड़ेंगे (चालक सुरक्षा प्रोत्साहन)।
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-zinc-800">
              <strong className="text-purple-400 block mb-0.5">4. नाइट आवर्स सर्ज चार्ज:</strong>
              तय नाइट आवर्स (10 PM से 6 AM) में यात्रा पर सीधे <strong>+₹200</strong> अतिरिक्त देय।
            </div>
          </div>
        </div>
      </div>

      {/* D3-based Daily Earnings Trend Line Chart */}
      <DriverEarningsChart completedRides={completedRidesList} />

      {/* Incoming Order Simulation Alert */}
      {incomingOrder && isOnline && (
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border-2 border-[#FF8C00] shadow-[0_0_30px_rgba(255,140,0,0.3)] space-y-3 animate-in bounce-in duration-300">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF8C00] animate-ping" />
              <h3 className="text-sm font-black text-white">{incomingOrder.title}</h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">
              ₹{incomingOrder.fare} (ग्रॉस)
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">पिकअप: {incomingOrder.pickup}</span>
            </div>
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#FF8C00] shrink-0" />
              <span className="truncate">ड्रॉप: {incomingOrder.drop}</span>
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>अनुमानित दूरी: {incomingOrder.distance} किमी</span>
              <span className="text-emerald-400 font-bold">
                ड्राइवर हिस्सा ({isInitial6Months ? '100% • 0% कमीशन' : '85%'}): ₹
                {isInitial6Months ? incomingOrder.fare : Math.round(incomingOrder.fare * 0.85)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => setIncomingOrder(null)}
              className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-bold text-xs"
            >
              अस्वीकार करें (Decline)
            </button>
            <button
              onClick={handleAcceptOrder}
              className="py-2.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 active:scale-95"
            >
              स्वीकार करें व डिजिटल पर्ची बनाएं
            </button>
          </div>
        </div>
      )}

      {/* Driver KYC & Document Upload Banner Card (Complete 3 Categories & Checklist) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-zinc-950 to-zinc-950 border border-amber-500/50 shadow-2xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF8C00] text-black font-black shrink-0 mt-0.5 shadow-md shadow-amber-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  ड्राइवर ऑनबोर्डिंग व RTO सत्यापन (KYC Documents)
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  ओला / उबर / सवारी सेतु मानक
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                ड्राइवर, वाहन एवं बैंक से जुड़े सभी अनिवार्य कागजात सीधे क्लाउड में सुरक्षित अपलोड व सत्यापित करें।
              </p>
            </div>
          </div>

          {onOpenDocumentUpload && (
            <button
              type="button"
              onClick={onOpenDocumentUpload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-black" />
              <span>दस्तावेज़ सत्यापन केंद्र खोलें</span>
            </button>
          )}
        </div>

        {/* 3 Categories Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 border-t border-zinc-800 text-[11px]">
          {/* Category 1 */}
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-400">1. ड्राइवर दस्तावेज</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">6 कागजात</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              कमर्शियल DL, आधार कार्ड, पैन कार्ड, पते का प्रमाण, पुलिस वेरिफिकेशन (PVC) व पासपोर्ट फोटो।
            </p>
          </div>

          {/* Category 2 */}
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-cyan-400">2. वाहन दस्तावेज</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-bold">5 कागजात</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              कमर्शियल RC (येलो प्लेट), वाहन बीमा, टैक्सी/कैरिज परमिट, प्रदूषण (PUC) व RTO फिटनेस।
            </p>
          </div>

          {/* Category 3 */}
          <div className="p-2.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-emerald-400">3. बैंक व भुगतान</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold">2 कागजात</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              ओनर/मालिक का पैन कार्ड एवं अर्निंग्स ट्रांसफर हेतु बैंक पासबुक कॉपी या कैंसल चेक।
            </p>
          </div>
        </div>
      </div>

      {/* Driver Digital Slip / Notepad Stamp Tool Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF8C00]" />
              <span>डिजिटल ड्राइवर पर्ची व मुहर (Notepad Stamp Slip)</span>
            </h3>
            <p className="text-xs text-zinc-400">
              प्रत्येक यात्रा समाप्ति पर तुरंत आधिकारिक डिजिटल रसीद व मुहर जनरेट करें
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          सवारी सेतु का ऑटोमेटेड नोटपैड स्टैम्प सिस्टम आपकी प्रत्येक ट्रिप का किराया, 15% प्लेटफॉर्म
          कमीशन और 85% ड्राइवर नेट पेआउट तुरंत कैलकुलेट करके आधिकारिक मुहर के साथ PDF जारी करता
          है।
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => handleGenerateDigitalSlip(240, 7.8)}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-[#FF8C00] text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98"
          >
            <FileDown className="w-4 h-4 text-black" />
            <span>तुरंत नई ड्राइवर पर्ची (PDF) बनाएं व डाउनलोड करें</span>
          </button>

          {lastGeneratedSlip && (
            <button
              onClick={() => generateDriverDigitalSlipPdf(lastGeneratedSlip)}
              className="py-3 px-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>पिछली पर्ची ({lastGeneratedSlip.slipId})</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver Rules & Verification Guide */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>ड्राइवर गाइड व RTO सत्यापन नियम</span>
        </h3>

        <div className="space-y-2 text-xs text-zinc-300">
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>अनिवार्य दस्तावेज:</strong> वैध ड्राइविंग लाइसेंस (Commercial/Transport DL),
              गाड़ी की RC, फिटनेस प्रमाण पत्र तथा वाणिज्यिक बीमा।
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>सवारी आचरण व सुरक्षा:</strong> वर्दी/सभ्य पोशाक, निर्धारित गति सीमा का पालन,
              यात्री से अतिरिक्त नकद न मांगना तथा अनिवार्य हेलमेट/सीटबेल्ट।
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-start gap-2">
            <span className="text-amber-400 font-bold">•</span>
            <span>
              <strong>दैनिक भुगतान व सेटलमेंट:</strong> आपका 85% भुगतान प्रतिदिन रात्रि 11 बजे सीधे
              आपके बैंक खाते / UPI में भेजा जाता है।
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
