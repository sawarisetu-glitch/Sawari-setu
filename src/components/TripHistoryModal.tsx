import React, { useState } from 'react';
import {
  X,
  History,
  Car,
  Truck,
  MapPin,
  Navigation,
  FileDown,
  Star,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  User,
  Check,
  FileText,
  ShieldCheck,
  Receipt,
  Download,
} from 'lucide-react';
import { RideBooking, LogisticsBooking } from '../types';
import { generateBookingReceiptPdf, generateLogisticsInvoicePdf } from '../utils/pdfGenerator';

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedRides: RideBooking[];
  completedShipments: LogisticsBooking[];
  onOpenRating: (tripId: string, tripTitle: string, type: 'ride' | 'logistics') => void;
}

export const TripHistoryModal: React.FC<TripHistoryModalProps> = ({
  isOpen,
  onClose,
  completedRides,
  completedShipments,
  onOpenRating,
}) => {
  const [filter, setFilter] = useState<'all' | 'ride' | 'logistics'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<{
    data: any;
    type: 'ride' | 'logistics';
  } | null>(null);

  if (!isOpen) return null;

  // Curated initial demo history if user has not taken rides yet
  const defaultPastRides: RideBooking[] = [
    {
      id: 'RIDE_SS_94501',
      passengerName: 'राम प्रकाश वर्मा',
      passengerPhone: '9450985355',
      pickup: 'दशमी का बाग, सिरसा, मेजा, प्रयागराज - 212305',
      pickupCoords: { lat: 25.2642, lng: 82.0912 },
      destination: 'मेजा रोड रेलवे स्टेशन, प्रयागराज',
      destCoords: { lat: 25.2356, lng: 82.0724 },
      mode: 'bike',
      distanceKm: 7.5,
      baseFare: 25,
      totalFare: 85,
      status: 'completed',
      driverName: 'सुरेश कुमार (चालक)',
      driverPhone: '9876543210',
      vehicleNumber: 'UP70-AZ-1122',
      driverRating: 4.9,
      paymentStatus: 'paid',
      createdAt: '2026-10-06 09:30 AM',
      otp: '4421',
      bookingTime: '2026-10-06 09:30 AM',
      paymentMethod: 'upi',
      agreedToSafety: true,
    },
    {
      id: 'RIDE_SS_94502',
      passengerName: 'राम प्रकाश वर्मा',
      passengerPhone: '9450985355',
      pickup: 'सिविल लाइंस बस स्टैंड, प्रयागराज',
      pickupCoords: { lat: 25.4528, lng: 81.8344 },
      destination: 'प्रयागराज जंक्शन रेलवे स्टेशन',
      destCoords: { lat: 25.4439, lng: 81.8256 },
      mode: 'auto',
      distanceKm: 3.2,
      baseFare: 40,
      totalFare: 78,
      status: 'completed',
      driverName: 'मोहित वर्मा',
      driverPhone: '9876543212',
      vehicleNumber: 'UP70-T-8877',
      driverRating: 4.8,
      paymentStatus: 'paid',
      createdAt: '2026-10-05 04:15 PM',
      otp: '8877',
      bookingTime: '2026-10-05 04:15 PM',
      paymentMethod: 'upi',
      agreedToSafety: true,
    },
  ];

  const defaultPastShipments: LogisticsBooking[] = [
    {
      id: 'LOG_SS_88921',
      senderName: 'राम प्रकाश वर्मा',
      senderPhone: '9450985355',
      pickup: 'सिरसा बाजार / गल्ला मंडी, मेजा, प्रयागराज',
      destination: 'ट्रांसपोर्ट नगर, धूमनगंज, प्रयागराज',
      goodsDescription: 'कृषि उपज / ताजे फल व अनाज (40 बोरी)',
      goodsCategory: 'खाद्यान्न / कृषि उपज',
      goodsValue: 45000,
      vehicleType: 'tata_ace',
      distanceKm: 38,
      baseFreight: 350,
      transitInsuranceOpted: true,
      insuranceAmount: 157,
      gstAmount: 247,
      totalAmount: 1618,
      status: 'delivered',
      driverName: 'राजेश यादव (छोटा हाथी)',
      driverPhone: '9876543214',
      vehicleNumber: 'UP70-BT-9900',
      lrNumber: 'LR-SS-2026-981',
      ewayBillNumber: 'EWB-099450985355',
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      bookingTime: '2026-10-04 10:00 AM',
    },
  ];

  const allRides = [...completedRides, ...defaultPastRides];
  const allShipments = [...completedShipments, ...defaultPastShipments];

  const handleDownloadRide = (ride: RideBooking, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDownloadingId(ride.id);
    generateBookingReceiptPdf(ride);
    setTimeout(() => setDownloadingId(null), 2500);
  };

  const handleDownloadShipment = (shipment: LogisticsBooking, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDownloadingId(shipment.id);
    generateLogisticsInvoicePdf(shipment);
    setTimeout(() => setDownloadingId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF8C00] text-black font-black flex items-center justify-center shadow-lg shadow-amber-500/20">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                ट्रिप इतिहास व इनवॉइस (Trip History & PDF Invoices)
              </h2>
              <p className="text-xs text-zinc-400">
                प्रत्येक यात्रा का आधिकारिक GST इनवॉइस व रसीद डाउनलोड करें
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Summary Counter */}
        <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: `सभी (${allRides.length + allShipments.length})` },
              { id: 'ride', label: `सवारी (${allRides.length})` },
              { id: 'logistics', label: `माल परिवहन (${allShipments.length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  filter === f.id
                    ? 'bg-[#FF8C00] text-black border-amber-300 shadow-md'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1-क्लिक PDF डाउनलोड उपलब्ध</span>
          </div>
        </div>

        {/* Trips List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
          {/* Passenger Rides */}
          {(filter === 'all' || filter === 'ride') &&
            allRides.map((ride) => {
              const isDownloading = downloadingId === ride.id;
              return (
                <div
                  key={ride.id}
                  onClick={() => setSelectedTrip({ data: ride, type: 'ride' })}
                  className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-500/50 cursor-pointer transition-all space-y-3 group shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF8C00] group-hover:bg-[#FF8C00] group-hover:text-black transition-all">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            सवारी: {ride.mode.toUpperCase()}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800">
                            {ride.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {ride.createdAt || ride.bookingTime || 'सफलतापूर्वक संपन्न'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-amber-400 text-sm">₹{ride.totalFare}</span>
                      <span className="block text-[10px] text-emerald-400 font-semibold">
                        ✓ पूर्ण भुगतान
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">पिकअप: {ride.pickup}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-3.5 h-3.5 text-[#FF8C00] shrink-0 mt-0.5" />
                      <span className="truncate">गंतव्य: {ride.destination}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-800">
                      <span>चालक: {ride.driverName} ({ride.vehicleNumber})</span>
                      <span>दूरी: {ride.distanceKm} किमी</span>
                    </div>
                  </div>

                  {/* Actions Bar with Prominent Download Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadRide(ride, e)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isDownloading
                          ? 'bg-emerald-600 text-white border border-emerald-500'
                          : 'bg-gradient-to-r from-amber-500 to-[#FF8C00] hover:from-amber-600 hover:to-orange-600 text-black border border-amber-400'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>✓ PDF इनवॉइस डाउनलोड हो गया!</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 text-black" />
                          <span>📥 डाउनलोड PDF इनवॉइस</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRating(
                          ride.id,
                          `सवारी (${ride.pickup} → ${ride.destination})`,
                          'ride'
                        );
                      }}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">रेटिंग दें</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Logistics Shipments */}
          {(filter === 'all' || filter === 'logistics') &&
            allShipments.map((shipment) => {
              const isDownloading = downloadingId === shipment.id;
              return (
                <div
                  key={shipment.id}
                  onClick={() => setSelectedTrip({ data: shipment, type: 'logistics' })}
                  className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/50 cursor-pointer transition-all space-y-3 group shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                        <Truck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            माल ढुलाई: {shipment.vehicleType.toUpperCase()}
                          </span>
                          <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60">
                            {shipment.lrNumber || shipment.id}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {shipment.bookingTime || 'डिलीवरी संपन्न'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-cyan-400 text-sm">₹{shipment.totalAmount}</span>
                      <span className="block text-[10px] text-emerald-400 font-semibold">
                        ✓ डिलीवर हो चुका
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">लोडिंग: {shipment.pickup}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="truncate">अनलोडिंग: {shipment.destination}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1.5 border-t border-zinc-800">
                      <span>माल: {shipment.goodsDescription}</span>
                      <span>दूरी: {shipment.distanceKm} किमी</span>
                    </div>
                  </div>

                  {/* Actions Bar with Prominent Download Button */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadShipment(shipment, e)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isDownloading
                          ? 'bg-emerald-600 text-white border border-emerald-500'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white border border-cyan-400'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>✓ LR टैक्स इनवॉइस डाउनलोड हो गया!</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-4 h-4 text-white" />
                          <span>📥 LR टैक्स इनवॉइस (PDF) डाउनलोड</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRating(
                          shipment.id,
                          `माल ढुलाई (${shipment.pickup} → ${shipment.destination})`,
                          'logistics'
                        );
                      }}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Star className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">रेटिंग दें</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Selected Trip Details Drawer / Sub-modal */}
        {selectedTrip && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-black text-white">
                    {selectedTrip.type === 'ride' ? 'सवारी इनवॉइस विवरण' : 'माल परिवहन LR विवरण'}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTrip(null)}
                  className="p-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">रेफरेंस ID / बिल्टी:</span>
                  <span className="font-mono text-white font-bold">
                    {selectedTrip.data.lrNumber || selectedTrip.data.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">समय:</span>
                  <span className="text-zinc-200">{selectedTrip.data.bookingTime || selectedTrip.data.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">पिकअप स्थान:</span>
                  <span className="text-zinc-200 max-w-[200px] text-right truncate">{selectedTrip.data.pickup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">गंतव्य स्थान:</span>
                  <span className="text-zinc-200 max-w-[200px] text-right truncate">{selectedTrip.data.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">दूरी:</span>
                  <span className="text-zinc-200">{selectedTrip.data.distanceKm} किमी</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">चालक का नाम:</span>
                  <span className="text-zinc-200">{selectedTrip.data.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">गाड़ी नंबर:</span>
                  <span className="text-zinc-200 font-mono">{selectedTrip.data.vehicleNumber}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold">
                  <span className="text-white">कुल भुगतान राशि:</span>
                  <span className="text-amber-400 font-black">
                    ₹{selectedTrip.data.totalFare || selectedTrip.data.totalAmount}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedTrip.type === 'ride') {
                    generateBookingReceiptPdf(selectedTrip.data);
                  } else {
                    generateLogisticsInvoicePdf(selectedTrip.data);
                  }
                }}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Download className="w-4 h-4" />
                <span>आधिकारिक PDF इनवॉइस डाउनलोड करें</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                className="px-4 py-3 bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl"
              >
                वापस
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>सभी इनवॉइस RTO एवं GST e-Way Bill अनुपालित हैं</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
