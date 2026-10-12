import React, { useState } from 'react';
import {
  Wallet,
  Tag,
  CheckCircle2,
  X,
  Plus,
  ShieldCheck,
  Percent,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { PromoCoupon } from '../types';
import { INITIAL_COUPONS } from '../utils/storage';
import confetti from 'canvas-confetti';

interface WalletCouponsModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletBalance: number;
  onAddMoney: (amount: number) => void;
  appliedCoupon: PromoCoupon | null;
  onApplyCoupon: (coupon: PromoCoupon | null) => void;
}

export const WalletCouponsModal: React.FC<WalletCouponsModalProps> = ({
  isOpen,
  onClose,
  walletBalance,
  onAddMoney,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [tab, setTab] = useState<'coupons' | 'wallet'>('coupons');
  const [inputCode, setInputCode] = useState('');
  const [customAddAmount, setCustomAddAmount] = useState(200);
  const [coupons] = useState<PromoCoupon[]>(INITIAL_COUPONS);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleApplyInputCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const found = coupons.find((c) => c.code.toUpperCase() === inputCode.trim().toUpperCase());
    if (found) {
      onApplyCoupon(found);
      setSuccessMsg(`कूपन ${found.code} लागू हो गया!`);
      setErrorMsg('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } else {
      setErrorMsg('अमान्य कूपन कोड। कृपया सूची में से मान्य कोड चुनें।');
      setSuccessMsg('');
    }
  };

  const handleSelectCoupon = (coupon: PromoCoupon) => {
    onApplyCoupon(coupon);
    setSuccessMsg(`कूपन ${coupon.code} सफलतापूर्वक लागू हुआ!`);
    setErrorMsg('');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleRemoveCoupon = () => {
    onApplyCoupon(null);
    setSuccessMsg('कूपन हटा दिया गया है।');
    setErrorMsg('');
  };

  const handleAddBalance = (amt: number) => {
    onAddMoney(amt);
    setSuccessMsg(`₹${amt} आपके सवारी सेतु वॉलेट में जोड़ दिए गए हैं!`);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8C00] p-2 flex items-center justify-center text-black font-black shadow-md">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">वॉलेट एवं कूपन छूट</h3>
              <p className="text-[11px] text-zinc-400">सवारी सेतु रिवार्ड्स व कैशबैक</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-2 bg-zinc-900/60 border-b border-zinc-800 grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => setTab('coupons')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'coupons'
                ? 'bg-[#FF8C00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>प्रोमो कोड्स (Offers)</span>
          </button>
          <button
            onClick={() => setTab('wallet')}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              tab === 'wallet'
                ? 'bg-[#FF8C00] text-black shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>वॉलेट (₹{walletBalance})</span>
          </button>
        </div>

        {/* Feedback message */}
        {successMsg && (
          <div className="px-4 py-2 bg-emerald-950/50 border-b border-emerald-800/60 text-emerald-300 text-xs font-semibold flex items-center justify-between">
            <span>✓ {successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 text-xs">
              ✕
            </button>
          </div>
        )}
        {errorMsg && (
          <div className="px-4 py-2 bg-red-950/50 border-b border-red-800/60 text-red-300 text-xs font-semibold">
            ✕ {errorMsg}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {tab === 'coupons' ? (
            <div className="space-y-4">
              {/* Apply promo code input */}
              <form onSubmit={handleApplyInputCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="कूपन कोड दर्ज करें (जैसे SETU50)"
                  className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold shadow-md"
                >
                  लागू करें
                </button>
              </form>

              {/* Active coupon status */}
              {appliedCoupon && (
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-extrabold text-emerald-300 font-mono">
                        {appliedCoupon.code} सक्रिय है!
                      </span>
                      <p className="text-[10px] text-zinc-400">{appliedCoupon.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-400 hover:underline font-bold px-2 py-1 bg-zinc-900 rounded-lg"
                  >
                    हटाएं
                  </button>
                </div>
              )}

              {/* Available Coupons list */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-zinc-400 uppercase tracking-wider text-[10px]">
                  उपलब्ध सवारी सेतु कूपन (Available Coupons)
                </h4>

                {coupons.map((coupon) => {
                  const isCurrent = appliedCoupon?.code === coupon.code;

                  return (
                    <div
                      key={coupon.code}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500'
                          : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-[#FF8C00] bg-black/60 px-2 py-0.5 rounded border border-amber-500/40">
                            {coupon.code}
                          </span>
                          <span className="font-bold text-white text-xs">{coupon.title}</span>
                        </div>
                        <p className="text-[11px] text-zinc-300">{coupon.description}</p>
                        <p className="text-[10px] text-zinc-500">
                          न्यूनतम किराया: ₹{coupon.minFare} • अधिकतम छूट: ₹{coupon.maxDiscount}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectCoupon(coupon)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-xs shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-zinc-800 hover:bg-[#FF8C00] text-zinc-200 hover:text-black'
                        }`}
                      >
                        {isCurrent ? 'सक्रिय' : 'लागू करें'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Wallet View */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    सवारी सेतु वॉलेट बैलेंस
                  </span>
                  <span className="text-2xl font-black text-[#FF8C00]">₹{walletBalance}</span>
                  <span className="text-[10px] text-emerald-400 block font-semibold mt-0.5">
                    ✓ तत्काल ऑटो-पेमेंट सक्रिय
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FF8C00] text-black flex items-center justify-center font-bold">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>

              {/* Add Balance Presets */}
              <div className="space-y-2">
                <label className="block text-zinc-300 font-semibold">वॉलेट में राशि जोड़ें:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAddBalance(amt)}
                      className="py-2.5 rounded-xl bg-zinc-900 hover:bg-[#FF8C00] hover:text-black border border-zinc-800 text-white font-bold transition-all text-xs"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Security info */}
              <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2 text-zinc-400 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  वॉलेट राशि का उपयोग सवारी एवं माल भाड़े के भुगतान के लिए सुरक्षित रूप से किया जा
                  सकता है।
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
