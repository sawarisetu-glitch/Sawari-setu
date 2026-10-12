import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  ShieldCheck,
  FileText,
  MapPin,
  Navigation,
  FileDown,
  PhoneCall,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  Info,
  Sparkles,
  Split,
} from 'lucide-react';
import {
  LogisticsVehicleType,
  LogisticsBooking,
  LiveVehicle,
  UserProfile,
  LiveTrafficInfo,
} from '../types';
import { LiveMap } from './LiveMap';
import { POPULAR_LOCATIONS } from '../utils/storage';
import { generateLogisticsInvoicePdf } from '../utils/pdfGenerator';
import { IndianVehicleBadge } from './IndianVehicleBadge';
import { LocationAutocompleteInput } from './LocationAutocompleteInput';
import {
  calculateRouteAndDistance,
  calculateHaversineDistanceKm,
  reverseGeocodeCoords,
} from '../utils/googleMapsService';
import confetti from 'canvas-confetti';
import { InvoiceSuccessModal } from './InvoiceSuccessModal';

interface LogisticsBookingTabProps {
  currentUser: UserProfile | null;
  vehicles: LiveVehicle[];
  activeShipment: LogisticsBooking | null;
  setActiveShipment: (shipment: LogisticsBooking | null) => void;
  onOpenPayment: (amount: number, desc: string, ref: string) => void;
  onTripCompleted?: (shipment: LogisticsBooking) => void;
  onRequireAuth?: () => void;
}

export const LogisticsBookingTab: React.FC<LogisticsBookingTabProps> = ({
  currentUser,
  vehicles,
  activeShipment,
  setActiveShipment,
  onOpenPayment,
  onTripCompleted,
  onRequireAuth,
}) => {
  const [senderName, setSenderName] = useState(currentUser?.name || '');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');

  useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.name || '');
      setSenderPhone(currentUser.phone || '');
    } else {
      setSenderName('');
      setSenderPhone('');
    }
  }, [currentUser]);
  const [pickup, setPickup] = useState('दशमी का बाग, सिरसा टाउन, प्रयागराज - 212305');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({ lat: 25.2642, lng: 82.0912 });
  const [destination, setDestination] = useState('ट्रांसपोर्ट नगर, धूमनगंज, प्रयागराज');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({ lat: 25.4312, lng: 81.7915 });
  const [goodsDescription, setGoodsDescription] = useState('कृषि उपज / ताजे फल व अनाज');
  const [goodsCategory, setGoodsCategory] = useState('खाद्यान्न / कृषि उपज');
  const [goodsValue, setGoodsValue] = useState(45000);
  const [distanceKm, setDistanceKm] = useState(38);
  const [vehicleType, setVehicleType] = useState<LogisticsVehicleType>('tata_ace');
  const [transitInsuranceOpted, setTransitInsuranceOpted] = useState(true);
  const [completedShipmentModal, setCompletedShipmentModal] = useState<LogisticsBooking | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_primary');
  const [currentTrafficInfo, setCurrentTrafficInfo] = useState<LiveTrafficInfo | null>(null);

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

  // Logistics fleet types:
  // Walker Runner, Loader, Tata Ace, Tata 407, 14 Ft, 19 Ft, 32 Ft
  const logisticsFleets: {
    id: LogisticsVehicleType;
    name: string;
    capacity: string;
    baseFare: number;
    perKm: number;
    description: string;
    tag?: string;
  }[] = [
    {
      id: 'loader',
      name: 'छोटा लोडर (3W Loader)',
      capacity: '500 किग्रा',
      baseFare: 250,
      perKm: 22,
      description: 'संकरे बाज़ारों के लिए उत्तम',
    },
    {
      id: 'tata_ace',
      name: 'टाटा एस (छोटा हाथी)',
      capacity: '750 - 1000 किग्रा',
      baseFare: 400,
      perKm: 28,
      description: 'सर्वाधिक लोकप्रिय हल्का वाणिज्यिक वाहन',
      tag: 'बेस्ट सेलर',
    },
    {
      id: 'tata_407',
      name: 'टाटा 407 (Medium Truck)',
      capacity: '2.5 टन',
      baseFare: 900,
      perKm: 42,
      description: 'भारी औद्योगिक व थोक सामान',
    },
    {
      id: 'truck_14ft',
      name: '14 फीट बंद कंटेनर',
      capacity: '4 टन',
      baseFare: 1600,
      perKm: 55,
      description: 'सुरक्षित वेदर-प्रूफ लॉजिस्टिक्स',
    },
    {
      id: 'truck_19ft',
      name: '19 फीट हैवी ट्रक',
      capacity: '7 टन',
      baseFare: 2600,
      perKm: 70,
      description: 'अंतर्राज्यीय भारी माल ढुलाई',
    },
    {
      id: 'truck_32ft',
      name: '32 फीट मल्टी-एक्सल कंटेनर',
      capacity: '15 - 20 टन',
      baseFare: 5500,
      perKm: 110,
      description: 'विशाल औद्योगिक खेप व ऑल-इंडिया परमिट',
      tag: 'हाई कैपेसिटी',
    },
  ];

  const currentFleet =
    logisticsFleets.find((f) => f.id === vehicleType) || logisticsFleets[1];

  // Freight calculation
  const baseFreight = Math.round(currentFleet.baseFare + distanceKm * currentFleet.perKm);
  const insuranceAmount = transitInsuranceOpted
    ? Math.max(50, Math.round(goodsValue * 0.0035))
    : 0;
  const gstAmount = Math.round(baseFreight * 0.05);
  const totalAmount = baseFreight + insuranceAmount + gstAmount;

  const handleBookGoods = () => {
    if (!currentUser) {
      if (onRequireAuth) {
        onRequireAuth();
      }
      return;
    }

    const assignedDriver =
      vehicles.find((v) => v.type === 'logistics' && v.subType === vehicleType) ||
      vehicles.find((v) => v.type === 'logistics') ||
      vehicles[0];

    const newShipment: LogisticsBooking = {
      id: `LOG_SS_${Math.floor(10000 + Math.random() * 90000)}`,
      senderName,
      senderPhone,
      pickup,
      destination,
      goodsDescription,
      goodsCategory,
      goodsValue,
      distanceKm,
      vehicleType,
      baseFreight,
      transitInsuranceOpted,
      insuranceAmount,
      gstAmount,
      totalAmount,
      status: 'assigned',
      ewayBillNumber: `EWB_${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      lrNumber: `LR-SS-UP32-${Math.floor(1000 + Math.random() * 9000)}`,
      driverName: assignedDriver.driverName,
      driverPhone: assignedDriver.phone,
      vehicleNumber: assignedDriver.vehicleNumber,
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'upi',
      paymentStatus: 'pending',
    };

    setActiveShipment(newShipment);
    confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Live Map showing Logistics Fleet */}
      <div className="relative">
        <LiveMap
          vehicles={vehicles}
          showPassengerLayer={false}
          showLogisticsLayer={true}
          pickupCoords={pickupCoords}
          destCoords={destCoords}
          pickupLabel={pickup}
          destLabel={destination}
          heightClass="h-[240px] sm:h-[280px]"
          tripType="logistics"
          activeTripId={activeShipment?.id}
          activeDriverName={activeShipment?.driverName}
          activeVehicleNumber={activeShipment?.vehicleNumber}
          activeVehicleType={activeShipment?.vehicleType}
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

      {/* Active Shipment Tracker Card */}
      {activeShipment ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border-2 border-cyan-500/80 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block">
                माल कंसाइनमेंट सक्रिय (LOGISTICS IN TRANSIT)
              </span>
              <h3 className="text-base font-extrabold text-white">
                LR नं: {activeShipment.lrNumber}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 block">e-Way Bill नं:</span>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-black/60 px-2 py-0.5 rounded border border-cyan-800">
                {activeShipment.ewayBillNumber}
              </span>
            </div>
          </div>

          {/* Assigned Freight Carrier & Driver */}
          <div className="p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/30">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {activeShipment.driverName} (चालक)
                </h4>
                <p className="text-xs font-mono text-zinc-300 font-bold">
                  {activeShipment.vehicleNumber}
                </p>
                <p className="text-[10px] text-zinc-500">
                  वाहन: {activeShipment.vehicleType.toUpperCase().replace('_', ' ')}
                </p>
              </div>
            </div>

            <a
              href={`tel:${activeShipment.driverPhone || '9450985355'}`}
              className="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 text-xs font-bold"
            >
              <PhoneCall className="w-4 h-4" />
              <span>कॉल</span>
            </a>
          </div>

          {/* Consignment Specs */}
          <div className="p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-400">माल विवरण:</span>
              <span className="text-zinc-200 font-medium">{activeShipment.goodsDescription}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">घोषित मूल्य:</span>
              <span className="text-zinc-200 font-medium">
                ₹{activeShipment.goodsValue.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">पारगमन बीमा:</span>
              <span className="text-emerald-400 font-bold">
                {activeShipment.transitInsuranceOpted ? '✓ सक्रिय (Active)' : 'नहीं'}
              </span>
            </div>
          </div>

          {/* Live Freight Traffic & Freight Corridor Advisory */}
          {currentTrafficInfo && (
            <div className="p-3 bg-zinc-950/90 rounded-2xl border border-cyan-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: currentTrafficInfo.statusBadgeColor }}
                  />
                  <span>मालवाहक ट्रैफिक: {currentTrafficInfo.statusLabelHindi}</span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300">
                  गति: {currentTrafficInfo.averageSpeedKmH} km/h •{' '}
                  {currentTrafficInfo.delayMins > 0 ? `+${currentTrafficInfo.delayMins}m विलंब` : 'समय पर'}
                </span>
              </div>

              {/* Alternative Bypass Route Selector for Freight Drivers */}
              {currentTrafficInfo.alternativeRoutes?.find((r) => r.id === 'route_bypass') && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-750 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Split className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate text-zinc-300">
                      {selectedRouteId === 'route_bypass' ? (
                        <strong className="text-emerald-400">
                          ✓ तेज बाईपास मार्ग सक्रिय (भारी ट्रकों हेतु सुरक्षित)
                        </strong>
                      ) : (
                        <span>
                          ट्रक बाईपास:{' '}
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
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md shadow-cyan-500/20'
                    }`}
                  >
                    {selectedRouteId === 'route_bypass' ? 'मुख्य मार्ग चुनें' : 'बाईपास चुनें 🚚'}
                  </button>
                </div>
              )}

              {currentTrafficInfo.freightNotice && (
                <p className="text-[11px] text-cyan-400/90 leading-tight">
                  🚚 {currentTrafficInfo.freightNotice}
                </p>
              )}
            </div>
          )}

          {/* Buttons: Download Tax Invoice & Pay */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => generateLogisticsInvoicePdf(activeShipment)}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all shadow-md"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>इनवॉइस (PDF) डाउनलोड</span>
            </button>

            <button
              onClick={() =>
                onOpenPayment(
                  activeShipment.totalAmount,
                  `माल परिवहन भाड़ा (LR: ${activeShipment.lrNumber})`,
                  activeShipment.id
                )
              }
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all shadow-md ${
                activeShipment.paymentStatus === 'paid'
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#FF8C00] text-black border-amber-300 hover:bg-orange-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {activeShipment.paymentStatus === 'paid'
                  ? '✓ भुगतान हो चुका'
                  : `₹${activeShipment.totalAmount} भुगतान करें`}
              </span>
            </button>
          </div>

          {/* Deliver & Finalize */}
          <div className="pt-2 border-t border-zinc-800">
            <button
              onClick={() => {
                const finished: LogisticsBooking = {
                  ...activeShipment,
                  status: 'delivered',
                  paymentStatus: 'paid',
                  bookingTime: activeShipment.bookingTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                // Automatically generate & download the PDF invoice!
                generateLogisticsInvoicePdf(finished);
                // Call completion callback to save in trip history
                onTripCompleted?.(finished);
                // Clear active shipment
                setActiveShipment(null);
                // Open celebration modal
                setCompletedShipmentModal(finished);
                confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              माल सुपुर्दगी (Delivery) पुष्टि करें व अंतिम इनवॉइस पाएं
            </button>
          </div>
        </div>
      ) : (
        /* Logistics Booking Form */
        <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>माल गाड़ी बुक करें (Logistics Booking)</span>
              </h2>
              <p className="text-xs text-zinc-400">सुरक्षित कमर्शियल माल ढुलाई व पारगमन बीमा</p>
            </div>
            <div className="bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-2.5 py-1 rounded-xl text-xs font-bold">
              लाइव ट्रक: 5 निकट
            </div>
          </div>

          {/* Sender Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                प्रेषक / फर्म का नाम
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="फर्म या प्रेषक का नाम"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">मोबाइल नंबर</label>
              <input
                type="tel"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="10 अंकों का मोबाइल"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Real Location Autocomplete & GPS Fields */}
          <div className="space-y-3">
            <LocationAutocompleteInput
              label="माल लोडिंग स्थान (Pickup / Loading Point)"
              value={pickup}
              onChange={setPickup}
              onSelectCoords={(coords, addr) => {
                setPickupCoords(coords);
                setPickup(addr);
                handleUpdateCoords(coords, destCoords);
              }}
              placeholder="माल लोडिंग का पता या मंडी खोजें..."
              isPickup={true}
              showGpsButton={true}
              currentLocationCoords={pickupCoords}
            />

            <LocationAutocompleteInput
              label="माल अनलोडिंग स्थान (Drop / Destination)"
              value={destination}
              onChange={setDestination}
              onSelectCoords={(coords, addr) => {
                setDestCoords(coords);
                setDestination(addr);
                handleUpdateCoords(pickupCoords, coords);
              }}
              placeholder="माल अनलोडिंग (गंतव्य) स्थान खोजें..."
              isPickup={false}
              showGpsButton={false}
              currentLocationCoords={pickupCoords}
            />
          </div>

          {/* Goods Description ("क्या भेजना है?") & Goods Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                क्या भेजना है? (Goods Description)
              </label>
              <input
                type="text"
                value={goodsDescription}
                onChange={(e) => setGoodsDescription(e.target.value)}
                placeholder="जैसे: इलेक्ट्रॉनिक्स, हार्डवेयर, अनाज..."
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                माल का अनुमानित मूल्य (₹ Goods Value)
              </label>
              <input
                type="number"
                min="1000"
                step="5000"
                value={goodsValue}
                onChange={(e) => setGoodsValue(parseFloat(e.target.value) || 1000)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Distance Input */}
          <div className="p-3 bg-zinc-900/60 rounded-2xl border border-zinc-800/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-zinc-300">परिवहन दूरी (किमी):</span>
              <p className="text-[10px] text-zinc-500">रूट व मैप आधारित दूरी</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                className="w-24 bg-zinc-900 border border-zinc-700 text-center font-bold text-cyan-400 rounded-lg py-1 px-2 text-sm focus:outline-none focus:border-[#FF8C00]"
              />
              <span className="text-xs text-zinc-400 font-bold">किमी</span>
            </div>
          </div>

          {/* Fleet Selector: Loader, Tata Ace, Tata 407, 14 Ft, 19 Ft, 32 Ft */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              वाहन चुनें (Select Freight Fleet):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {logisticsFleets.map((fleet) => {
                const isSelected = vehicleType === fleet.id;
                const fleetFreight = Math.round(fleet.baseFare + distanceKm * fleet.perKm);

                return (
                  <button
                    key={fleet.id}
                    type="button"
                    onClick={() => setVehicleType(fleet.id)}
                    className={`relative p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {fleet.tag && (
                      <span className="absolute -top-2 right-2 text-[9px] font-extrabold bg-cyan-400 text-black px-1.5 py-0.2 rounded-full shadow-sm">
                        {fleet.tag}
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-1.5">
                      <IndianVehicleBadge
                        vehicleType={fleet.id}
                        size="md"
                        showBorder={isSelected}
                        className={isSelected ? 'border-cyan-400 ring-1 ring-cyan-400' : ''}
                      />
                      <span className="text-xs font-extrabold text-cyan-400">₹{fleetFreight}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white">{fleet.name}</h4>
                    <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">{fleet.capacity}</p>
                    <span className="text-[9px] text-zinc-500 block mt-1 line-clamp-1">
                      {fleet.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transit Insurance Toggle Option */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-zinc-900 to-zinc-900 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  व्यापक पारगमन बीमा (Transit Insurance)
                </h4>
                <p className="text-[10px] text-zinc-400">
                  चोरी, क्षति व दुर्घटना पर 100% माल सुरक्षा कवर (₹{insuranceAmount})
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={transitInsuranceOpted}
                onChange={(e) => setTransitInsuranceOpted(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Freight Breakdown Display: Freight + Insurance + GST */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-zinc-400">
              <span>मूल भाड़ा व माइलेज (Base Freight):</span>
              <span>₹{baseFreight}</span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>पारगमन बीमा शुल्क (0.35% Transit Cover):</span>
              <span className={transitInsuranceOpted ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>
                {transitInsuranceOpted ? `+ ₹${insuranceAmount}` : 'लागू नहीं'}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-400">
              <span>लागू GST (5% Road Freight):</span>
              <span>+ ₹{gstAmount}</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 flex items-center justify-between font-bold text-sm">
              <span className="text-white">कुल देय भाड़ा (Total Freight):</span>
              <span className="text-xl font-black text-[#FF8C00]">₹{totalAmount}</span>
            </div>
          </div>

          {/* Orange BOOK GOODS Button */}
          <button
            type="button"
            onClick={handleBookGoods}
            className="w-full py-4 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-sm tracking-wide transition-all shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98"
          >
            <span>माल गाड़ी बुक करें (BOOK GOODS • ₹{totalAmount})</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      )}

      {/* Automatic Invoice Generated Success Modal */}
      <InvoiceSuccessModal
        isOpen={!!completedShipmentModal}
        onClose={() => setCompletedShipmentModal(null)}
        tripType="logistics"
        shipmentData={completedShipmentModal}
      />
    </div>
  );
};
