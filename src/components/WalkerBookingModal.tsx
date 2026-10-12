import React, { useState } from 'react';
import {
  X,
  Footprints,
  Pill,
  ShoppingBag,
  UtensilsCrossed,
  FileText,
  Briefcase,
  Luggage,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  QrCode,
  Copy,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface WalkerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onOpenPayment?: (amount: number, desc: string, ref: string) => void;
}

export const WalkerBookingModal: React.FC<WalkerBookingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenPayment,
}) => {
  const [selectedTask, setSelectedTask] = useState<string>('medicine');
  const [taskDetail, setTaskDetail] = useState('');
  const [shopPickup, setShopPickup] = useState('न्यू लाइफ मेडिकल स्टोर, सिरसा बाज़ार, प्रयागराज');
  const [dropAddress, setDropAddress] = useState('दशमी का बाग, सिरसा टाउन, प्रयागराज');
  const [distanceKm, setDistanceKm] = useState(1.5);
  const [senderPhone, setSenderPhone] = useState(currentUser.phone || '9450985355');
  const [activeBooking, setActiveBooking] = useState<{
    id: string;
    otp: string;
    totalFare: number;
    walkerName: string;
    walkerPhone: string;
    walkerRating: number;
    etaMins: number;
    status: 'assigned' | 'at_shop' | 'picked_up' | 'completed';
  } | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!isOpen) return null;

  const taskCategories = [
    {
      id: 'medicine',
      title: 'दवाइयां लाना',
      sub: 'मेडिकल स्टोर से दवा / पर्चा',
      icon: Pill,
      color: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
      defaultDetail: 'पर्चा दिखाकर बीपी व शुगर की दवाइयां मेडिकल से लाना',
    },
    {
      id: 'grocery',
      title: 'राशन व किराना',
      sub: 'सब्जी, दूध, फल या किराना',
      icon: ShoppingBag,
      color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      defaultDetail: 'किराना दुकान से 5 किलो आटा, तेल व ताजी सब्जियां लाना',
    },
    {
      id: 'food',
      title: 'टिफिन / गरम खाना',
      sub: 'घर या होटल से टिफिन डिलीवरी',
      icon: UtensilsCrossed,
      color: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      defaultDetail: 'घर से गरम टिफिन ऑफिस/दुकान तक पहुंचाना',
    },
    {
      id: 'documents',
      title: 'कागजात / पार्सल',
      sub: 'चाबी, फाइल या जरूरी पैकेट',
      icon: FileText,
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/30',
      defaultDetail: 'जरूरी फाइल / लिफाफा सुरक्षित पते पर तुरंत देना',
    },
    {
      id: 'market_errand',
      title: 'बाज़ार से खरीदारी',
      sub: 'लोकल दुकान से सामान खरीदना',
      icon: Briefcase,
      color: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      defaultDetail: 'सिरसा मेन मार्केट से स्टेशनरी व घरेलू सामान लाना',
    },
    {
      id: 'porter_luggage',
      title: 'स्टेशन कुली / हेल्पर',
      sub: 'भारी बैग व सामान उठाने में मदद',
      icon: Luggage,
      color: 'text-orange-400 bg-orange-500/15 border-orange-500/30',
      defaultDetail: 'बस स्टॉप / रेलवे स्टेशन से घर तक सामान ढोना',
    },
  ];

  // Pricing: 0-1 km: ₹25, then ₹12/km. Max 5 km.
  const calculateFare = (km: number) => {
    const clamped = Math.min(5, Math.max(0.5, km));
    if (clamped <= 1) return 25;
    const extra = Math.round((clamped - 1) * 10) / 10;
    return Math.round(25 + extra * 12);
  };

  const fare = calculateFare(distanceKm);

  const handleSelectTask = (catId: string) => {
    setSelectedTask(catId);
    const cat = taskCategories.find((c) => c.id === catId);
    if (cat && !taskDetail) {
      setTaskDetail(cat.defaultDetail);
    }
  };

  const handleBookWalker = () => {
    const bookingId = `WLK_SS_${Math.floor(10000 + Math.random() * 90000)}`;
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveBooking({
      id: bookingId,
      otp,
      totalFare: fare,
      walkerName: 'संजय निषाद (सत्यापित लोकल वॉकर)',
      walkerPhone: '9450985355',
      walkerRating: 4.95,
      etaMins: Math.max(7, Math.round(distanceKm * 6)),
      status: 'assigned',
    });
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
  };

  const handleCopyOtp = () => {
    if (!activeBooking) return;
    navigator.clipboard.writeText(activeBooking.otp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const currentCat = taskCategories.find((t) => t.id === selectedTask)?.title || 'वॉकर कार्य';
    const text = `*🏃‍♂️ सवारी सेतु (Savari Setu) - वॉकर बुकिंग अनुरोध*\n\n` +
      `👤 *ग्राहक:* ${currentUser.name || 'यात्री'}\n` +
      `📞 *मोबाइल:* ${senderPhone}\n` +
      `📦 *कार्य प्रकार:* ${currentCat}\n` +
      `📝 *विवरण:* ${taskDetail || currentCat}\n` +
      `📍 *दुकान/पिकअप:* ${shopPickup}\n` +
      `🎯 *डिलीवरी पता:* ${dropAddress}\n` +
      `🛣️ *दूरी:* ${distanceKm} किमी\n` +
      `💰 *किराया:* ₹${fare} (100% पैसा वॉकर साथी को)\n\n` +
      `_कृपया नजदीकी सत्यापित वॉकर साथी को तुरंत रवाना करें!_\n` +
      `- सवारी सेतु हेल्पडेस्क: 9450985355`;

    window.open(`https://wa.me/919450985355?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8C00]/20 text-[#FF8C00] flex items-center justify-center border border-amber-500/30">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>वॉकर बुकिंग (Walker Runner & Porter)</span>
                <span className="text-[10px] bg-amber-500/20 text-[#FF8C00] font-extrabold px-2 py-0.5 rounded-full border border-amber-500/30">
                  लोकल 5 किमी
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                दवाई, किराना, टिफिन, पार्सल व कुली सेवा — पैदल रनर तुरंत हाजिर
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {activeBooking ? (
            /* Active Walker Card */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-3xl bg-zinc-900 border-2 border-amber-500/80 shadow-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      सत्यापित वॉकर असाइन हो गया!
                    </span>
                    <h4 className="text-sm font-black text-white">बुकिंग ID: {activeBooking.id}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">सत्यापन OTP:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-mono font-black text-[#FF8C00] bg-black/70 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
                        {activeBooking.otp}
                      </span>
                      <button
                        onClick={handleCopyOtp}
                        className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                        title="OTP कॉपी करें"
                      >
                        {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Runner Profile */}
                <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center font-bold text-xl border border-amber-500/30">
                      🏃
                    </div>
                    <div>
                      <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                        {activeBooking.walkerName}
                        <span className="text-[10px] text-amber-400 font-bold">★ {activeBooking.walkerRating}</span>
                      </h5>
                      <p className="text-[10px] text-emerald-400 font-bold">
                        ✓ आधार व पुलिस सत्यापित लोकल साथी
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        अनुमानित समय: ~{activeBooking.etaMins} मिनट में आपके पास
                      </p>
                    </div>
                  </div>

                  <a
                    href={`tel:${activeBooking.walkerPhone}`}
                    className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 text-xs font-bold"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>कॉल</span>
                  </a>
                </div>

                {/* Route Summary */}
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-1.5 text-[11px]">
                  <div className="flex items-start gap-2 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="truncate"><strong>पिकअप / दुकान:</strong> {shopPickup}</span>
                  </div>
                  <div className="flex items-start gap-2 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8C00] shrink-0 mt-0.5" />
                    <span className="truncate"><strong>डिलीवरी:</strong> {dropAddress}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-850 text-zinc-400">
                    <span>दूरी: {distanceKm} किमी</span>
                    <span className="text-white font-bold">किराया: ₹{activeBooking.totalFare}</span>
                  </div>
                </div>

                {/* Progress Tracking Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-amber-400">1. वॉकर रवाना हुआ</span>
                    <span className="text-zinc-500">2. सामान उठाया</span>
                    <span className="text-zinc-500">3. डिलीवरी पूर्ण</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-[#FF8C00] h-2 rounded-full w-1/3 animate-pulse" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleShareWhatsApp}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>व्हाट्सएप पर शेयर</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenPayment) {
                        onOpenPayment(activeBooking.totalFare, 'वॉकर डिलीवरी शुल्क', activeBooking.id);
                      }
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FF8C00] text-black font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:bg-orange-600 transition-all"
                  >
                    <span>₹{activeBooking.totalFare} भुगतान करें</span>
                  </button>
                </div>

                {/* Complete Button */}
                <button
                  onClick={() => {
                    alert('वॉकर कार्य सफलतापूर्वक संपन्न हुआ! धन्यवाद।');
                    setActiveBooking(null);
                    onClose();
                  }}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
                >
                  कार्य संपन्न करें व बंद करें
                </button>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <>
              {/* Task Category Grid */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  1. कार्य का प्रकार चुनें (Select Errand Service):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {taskCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedTask === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleSelectTask(cat.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/60'
                            : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${cat.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-white text-xs truncate">{cat.title}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{cat.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task Details Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  2. क्या लाना या करना है? (Task Description):
                </label>
                <textarea
                  rows={2}
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                  placeholder="उदा. मेडिकल से शुगर की दवा लानी है / दुकान से 5 किलो आटा लाना है..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl p-2.5 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              {/* Locations */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>दुकान या पिकअप स्थान (Pickup / Shop):</span>
                  </label>
                  <input
                    type="text"
                    value={shopPickup}
                    onChange={(e) => setShopPickup(e.target.value)}
                    placeholder="दुकान या लैंडमार्क का नाम दर्ज करें"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>घर / डिलीवरी का पता (Drop Location):</span>
                  </label>
                  <input
                    type="text"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    placeholder="अपना घर का पता या कमरा नंबर"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Distance Slider */}
              <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-zinc-300">अनुमानित पैदल दूरी:</span>
                  <p className="text-[10px] text-zinc-500">लोकल कस्बा दायरा (अधिकतम 5 किमी)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.5"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                    className="w-24 accent-[#FF8C00] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-400 min-w-[45px] text-right font-mono">
                    {distanceKm} km
                  </span>
                </div>
              </div>

              {/* Transparent Fare Policy Box */}
              <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF8C00]" />
                    <span>वॉकर किराया ब्रेकअप (0% कंपनी कमीशन)</span>
                  </span>
                  <span className="text-sm font-black text-[#FF8C00]">₹{fare}</span>
                </div>

                <div className="space-y-1 text-[11px] text-zinc-400">
                  <div className="flex justify-between">
                    <span>• 0 से 1 किमी बेस चार्ज:</span>
                    <span>₹25</span>
                  </div>
                  {distanceKm > 1 && (
                    <div className="flex justify-between">
                      <span>• 1 किमी से अतिरिक्त ({(distanceKm - 1).toFixed(1)} किमी @ ₹12/किमी):</span>
                      <span>₹{fare - 25}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-emerald-400 pt-1 border-t border-zinc-800 font-bold">
                    <span>वॉकर साथी की आय (100% हकदार):</span>
                    <span>₹{fare} (0% कंपनी डिडक्शन)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>अधिकतम 10 किलो तक पार्सल / बैग सुरक्षित रूप से डिलीवरी।</span>
                </div>
              </div>

              {/* Booking Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleBookWalker}
                  className="w-full py-3.5 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98"
                >
                  <Footprints className="w-4 h-4" />
                  <span>तत्काल वॉकर बुक करें (BOOK WALKER • ₹{fare})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>व्हाट्सएप पर वॉकर ऑर्डर भेजें (WhatsApp Bot)</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
