import React from 'react';
import {
  CheckCircle2,
  FileDown,
  X,
  Star,
  MapPin,
  Navigation,
  ShieldCheck,
  Receipt,
  Car,
  Truck,
} from 'lucide-react';
import { RideBooking, LogisticsBooking } from '../types';
import { generateBookingReceiptPdf, generateLogisticsInvoicePdf } from '../utils/pdfGenerator';

interface InvoiceSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripType: 'ride' | 'logistics';
  rideData?: RideBooking | null;
  shipmentData?: LogisticsBooking | null;
  onOpenRating?: (tripId: string, title: string, type: 'ride' | 'logistics') => void;
  onOpenTripHistory?: () => void;
}

export const InvoiceSuccessModal: React.FC<InvoiceSuccessModalProps> = ({
  isOpen,
  onClose,
  tripType,
  rideData,
  shipmentData,
  onOpenRating,
  onOpenTripHistory,
}) => {
  const [downloadedAgain, setDownloadedAgain] = React.useState(false);

  if (!isOpen) return null;

  const handleDownloadAgain = () => {
    if (tripType === 'ride' && rideData) {
      generateBookingReceiptPdf(rideData);
    } else if (tripType === 'logistics' && shipmentData) {
      generateLogisticsInvoicePdf(shipmentData);
    }
    setDownloadedAgain(true);
    setTimeout(() => setDownloadedAgain(false), 2500);
  };

  const isRide = tripType === 'ride' && rideData;
  const title = isRide
    ? `सवारी यात्रा संपन्न (Ride Completed)`
    : `माल सुरक्षित सुपुर्द (Shipment Delivered)`;
  const idLabel = isRide ? `सवारी ID: ${rideData?.id}` : `LR सं.: ${shipmentData?.lrNumber || shipmentData?.id}`;
  const amount = isRide ? rideData?.totalFare : shipmentData?.totalAmount;
  const pickup = isRide ? rideData?.pickup : shipmentData?.pickup;
  const destination = isRide ? rideData?.destination : shipmentData?.destination;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with Company Logo & Status */}
        <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/sawari_setu_logo.jpg"
              alt="सवारी सेतु"
              className="w-10 h-10 rounded-xl object-cover border border-amber-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white">{title}</h3>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">{idLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Automatic PDF Download Notice Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
              <Receipt className="w-5 h-5 shrink-0" />
              <span>आधिकारिक PDF इनवॉइस स्वतः डाउनलोड हो गया है!</span>
            </div>
            <p className="text-[11px] text-zinc-300 pl-7">
              सवारी सेतु का GST अनुपालित बिल व रसीद आपके ब्राउज़र/फोन के डाउनलोड फ़ोल्डर में सुरक्षित सहेज दी गई है।
            </p>
          </div>

          {/* Trip Summary Details Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-[#FF8C00]">
                  {isRide ? <Car className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                </div>
                <span className="font-bold text-white text-xs">
                  {isRide
                    ? `सवारी: ${(rideData?.mode || '').toUpperCase()}`
                    : `माल ढुलाई: ${(shipmentData?.vehicleType || '').toUpperCase()}`}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">कुल भाड़ा / किराया:</span>
                <span className="font-black text-amber-400 text-sm">₹{amount}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-zinc-300 text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="truncate">पिकअप: {pickup}</span>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="w-3.5 h-3.5 text-[#FF8C00] shrink-0 mt-0.5" />
                <span className="truncate">गंतव्य: {destination}</span>
              </div>
            </div>

            {/* Master Fare Breakdown Badges */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[10px]">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> टोल टैक्स शामिल (₹0 अलग से)
                </span>
                <span className="text-zinc-500 font-mono">
                  {isRide ? rideData?.vehicleNumber : shipmentData?.vehicleNumber}
                </span>
              </div>
              {isRide && (rideData?.weatherSurge || rideData?.nightSurge) && (
                <div className="flex items-center gap-2 text-amber-300">
                  {rideData.weatherSurge ? <span>• मौसम सर्ज: +₹{rideData.weatherSurge}</span> : null}
                  {rideData.nightSurge ? <span>• नाइट सर्ज: +₹{rideData.nightSurge}</span> : null}
                </div>
              )}
              {isRide && (
                <div className="text-zinc-400 flex items-center justify-between pt-0.5">
                  <span>कमीशन नीति:</span>
                  <span className="text-[#FF8C00] font-bold">
                    0% कंपनी मार्जिन (100% पैसा चालक साथी को)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            {/* WhatsApp Share Receipt Button */}
            <button
              type="button"
              onClick={() => {
                const shareText = `*🚖 सवारी सेतु (Sawari Setu) - यात्रा रसीद*\n\n` +
                  `🔖 *ट्रिप ID:* ${isRide ? rideData?.id : shipmentData?.id}\n` +
                  `🚗 *सेवा:* ${isRide ? (rideData?.mode || '').toUpperCase() : (shipmentData?.vehicleType || '').toUpperCase()}\n` +
                  `📍 *पिकअप:* ${pickup}\n` +
                  `🎯 *गंतव्य:* ${destination}\n` +
                  `💰 *कुल किराया:* ₹${amount} (टोल शामिल, ₹0 कमीशन)\n` +
                  `🪪 *वाहन:* ${isRide ? rideData?.vehicleNumber : shipmentData?.vehicleNumber}\n\n` +
                  `सवारी सेतु 24x7 हेल्पलाइन: 9450985355`;
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>📲 व्हाट्सएप पर रसीद शेयर करें (WhatsApp Share)</span>
            </button>

            {/* Re-download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadAgain}
              className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 active:scale-95 transition-all"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>
                {downloadedAgain ? '✓ दोबारा डाउनलोड हो गया!' : '📥 दोबारा PDF इनवॉइस डाउनलोड करें'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              {/* Rate Driver Button */}
              {onOpenRating && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (isRide && rideData) {
                      onOpenRating(
                        rideData.id,
                        `सवारी (${rideData.pickup} → ${rideData.destination})`,
                        'ride'
                      );
                    } else if (shipmentData) {
                      onOpenRating(
                        shipmentData.id,
                        `माल ढुलाई (${shipmentData.pickup} → ${shipmentData.destination})`,
                        'logistics'
                      );
                    }
                  }}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>चालक को रेटिंग दें</span>
                </button>
              )}

              {/* View History Button */}
              {onOpenTripHistory && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTripHistory();
                  }}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all"
                >
                  <Receipt className="w-3.5 h-3.5 text-zinc-300" />
                  <span>ट्रिप इतिहास देखें</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] text-zinc-500">24x7 हेल्पलाइन: 9450985355</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
