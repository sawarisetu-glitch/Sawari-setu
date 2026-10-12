import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  MessageCircle,
  Instagram,
  Facebook,
  QrCode,
  Gift,
  ExternalLink,
  Sparkles,
  Send,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode?: string;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  referralCode = 'SETU9450',
}) => {
  const [activePlatform, setActivePlatform] = useState<'whatsapp' | 'instagram' | 'facebook' | 'qr'>('whatsapp');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  if (!isOpen) return null;

  const appShareUrl = (() => {
    if (typeof window === 'undefined') return 'https://ais-pre-m2dhejcqpk2noml5e5nw7m-335155965595.asia-southeast1.run.app';
    const origin = window.location.origin || '';
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'https://ais-pre-m2dhejcqpk2noml5e5nw7m-335155965595.asia-southeast1.run.app';
    }
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  })();

  const viralHindiPromoText = `🚖 *सवारी सेतु (Sawari Setu)* - अब आपका हर सफर आसान और सुरक्षित!\n\n✨ *एक ही ऐप में सवारी भी और माल ढुलाई भी:*\n• बाइक, ऑटो, ई-रिक्शा, मिनी कार व शेयर कैब\n• माल परिवहन: छोटा हाथी (Tata Ace), 3W लोडर, 407 व 14-32 फीट ट्रक्स\n• 100% पारगमन सुरक्षा बीमा (Transit Insurance)\n• 24x7 आपातकालीन SOS व जीपीएस लाइव ट्रैकिंग\n\n🎁 मेरे रेफरल कोड *${referralCode}* का उपयोग करें और पहली सवारी पर ₹50 की विशेष छूट पाएं!\n\n📲 अभी डाउनलोड या बुक करें:\n${appShareUrl}\n\nहेल्पलाइन: 9450985355 | ईमेल: sawarisetu@gmail.com`;

  const instagramCaptionText = `सफर आसान • साथ सबका! 🚖📦
भारत का सबसे भरोसेमंद सवारी एवं माल परिवहन प्लेटफॉर्म - 'सवारी सेतु' (Sawari Setu)।

अब बाइक टैक्सी, ऑटो, कार और मालवाहक छोटा हाथी (Tata Ace) बुक करें सीधे अपने फोन से।
✔️ लाइव जीपीएस ट्रैकिंग
✔️ पारगमन बीमा सुरक्षा
✔️ डिजिटल इनवॉइस व रसीद

📲 लिंक बायो में देखें: ${appShareUrl}
🎁 यूज कोड: ${referralCode} (₹50 OFF)

#SawariSetu #सवारीसेतु #RideHailing #LogisticsIndia #SafarAasan #TataAce #Lucknow #UttarPradesh #TransportIndia #CabBooking #GoodsTransport`;

  const facebookPromoText = `सवारी सेतु (Sawari Setu) - आपकी सवारी, आपके पास! अब बाइक, ऑटो, कार के साथ-साथ छोटा हाथी व भारी मालवाहक ट्रक बुक करें सबसे किफायती दरों में। 24x7 लाइव जीपीएस व बीमा सुरक्षा। कोड ${referralCode} से पाएँ ₹50 डिस्काउंट! ${appShareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${appShareUrl}?ref=${referralCode}`);
    setCopiedLink(true);
    confetti({ particleCount: 40, spread: 45, origin: { y: 0.7 } });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedMessage(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(viralHindiPromoText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleFacebookShare = () => {
    const encodedUrl = encodeURIComponent(`${appShareUrl}?ref=${referralCode}`);
    const encodedQuote = encodeURIComponent(facebookPromoText);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`, '_blank');
  };

  const handleInstagramShare = () => {
    // Copy the styled caption to clipboard and redirect to Instagram
    navigator.clipboard.writeText(instagramCaptionText);
    setCopiedMessage(true);
    setTimeout(() => {
      window.open('https://www.instagram.com/', '_blank');
    }, 400);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'सवारी सेतु (Sawari Setu) - सफर आसान • साथ सबका',
          text: `सवारी सेतु ऐप से तुरंत सवारी और माल परिवहन बुक करें। कूपन कोड: ${referralCode}`,
          url: `${appShareUrl}?ref=${referralCode}`,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8C00] to-orange-600 p-2 flex items-center justify-center shadow-lg shadow-amber-500/20 text-black">
              <Share2 className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>कंपनी प्रचार-प्रसार व शेयरिंग हब</span>
                <span className="text-[10px] bg-amber-500/20 text-[#FF8C00] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Viral Marketing
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                व्हाट्सएप, इंस्टाग्राम व फेसबुक पर शेयर करें और ब्रांड बढ़ाएं
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* Referral & Promo Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF8C00] text-black flex items-center justify-center font-black">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  रेफरल प्रोग्राम (Refer & Earn ₹50)
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-mono font-black text-white bg-black/60 px-2 py-0.5 rounded border border-zinc-700">
                    {referralCode}
                  </span>
                  <span className="text-[10px] text-zinc-400">विशेष छूट कोड</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'लिंक कॉपीड!' : 'लिंक कॉपी करें'}</span>
            </button>
          </div>

          {/* Referral Reward Tracking State (Track Referrals & Earnings) */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>रेफरल व रिवॉर्ड ट्रैकर (Reward Tracking State)</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                एक्टिव बोनस
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 text-[10px] block">आमंत्रित मित्र</span>
                <span className="text-sm font-black text-white">4 सदस्य</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 text-[10px] block">कुल कमाई</span>
                <span className="text-sm font-black text-amber-400">₹200</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-zinc-500 text-[10px] block">सक्रिय डिस्काउंट</span>
                <span className="text-sm font-black text-emerald-400">₹50 OFF</span>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-[11px]">
              <span className="text-zinc-300">
                अगला माइलस्टोन: <strong>1 और दोस्त</strong> जोड़ने पर ₹100 फ्री राइड वाउचर
              </span>
              <span className="font-bold text-amber-400">80% पूर्ण</span>
            </div>
          </div>

          {/* Social Platform Selection Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800 text-[11px]">
            <button
              onClick={() => setActivePlatform('whatsapp')}
              className={`py-2 rounded-xl font-bold flex flex-col items-center gap-1 transition-all ${
                activePlatform === 'whatsapp'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>व्हाट्सएप</span>
            </button>
            <button
              onClick={() => setActivePlatform('instagram')}
              className={`py-2 rounded-xl font-bold flex flex-col items-center gap-1 transition-all ${
                activePlatform === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>इंस्टाग्राम</span>
            </button>
            <button
              onClick={() => setActivePlatform('facebook')}
              className={`py-2 rounded-xl font-bold flex flex-col items-center gap-1 transition-all ${
                activePlatform === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Facebook className="w-4 h-4" />
              <span>फेसबुक</span>
            </button>
            <button
              onClick={() => setActivePlatform('qr')}
              className={`py-2 rounded-xl font-bold flex flex-col items-center gap-1 transition-all ${
                activePlatform === 'qr'
                  ? 'bg-[#FF8C00] text-black shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>QR कोड</span>
            </button>
          </div>

          {/* WhatsApp Sharing Card */}
          {activePlatform === 'whatsapp' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  व्हाट्सएप प्रचार संदेश (WhatsApp Viral Campaign):
                </span>
                <span className="text-[10px] text-zinc-500">ग्रुप व स्टेटस पर शेयर करें</span>
              </div>

              {/* Message Preview Box */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-mono">
                {viralHindiPromoText}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>व्हाट्सएप पर तुरंत शेयर करें (One-Tap Share)</span>
                </button>
                <button
                  onClick={() => handleCopyMessage(viralHindiPromoText)}
                  className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700"
                  title="पूरा टेक्स्ट कॉपी करें"
                >
                  {copiedMessage ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Instagram Sharing Card */}
          {activePlatform === 'instagram' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-pink-400 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4" />
                  इंस्टाग्राम पोस्ट व रील्स कैप्शन (Post / Story / Bio):
                </span>
                <span className="text-[10px] text-zinc-500">@sawarisetu</span>
              </div>

              {/* Caption Preview Box */}
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-mono">
                {instagramCaptionText}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleInstagramShare}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>कैप्शन कॉपी करें और इंस्टाग्राम खोलें</span>
                </button>
              </div>
            </div>
          )}

          {/* Facebook Sharing Card */}
          {activePlatform === 'facebook' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Facebook className="w-4 h-4" />
                  फेसबुक पोस्ट व ग्रुप शेयरिंग (Facebook Campaign):
                </span>
                <span className="text-[10px] text-zinc-500">fb.me/sawarisetu</span>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line">
                {facebookPromoText}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFacebookShare}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>फेसबुक पर अभी पोस्ट करें</span>
                </button>
                <button
                  onClick={() => handleCopyMessage(facebookPromoText)}
                  className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1 border border-zinc-700"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* QR Code Card */}
          {activePlatform === 'qr' && (
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center text-center space-y-3">
              <span className="font-bold text-amber-400">
                ऑफलाइन प्रचार व पैम्फलेट हेतु QR कोड (Scan & Ride)
              </span>

              <div className="w-40 h-40 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center">
                <div className="w-full h-full bg-[#121212] rounded-xl flex flex-col items-center justify-center text-center p-2 text-amber-400">
                  <QrCode className="w-20 h-20 text-[#FF8C00] mb-1" />
                  <span className="text-[10px] font-mono font-bold text-white">सवारी सेतु • 9450985355</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-400">
                दुकानों, मंडियों, स्टैंड्स और वाहनों पर चिपकाने के लिए यह QR कोड स्कैन करके ग्राहक सीधे
                आपकी ऐप पर पहुंचेंगे।
              </p>
            </div>
          )}

          {/* Native Mobile Share Button */}
          <div className="pt-2 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleNativeShare}
              className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all"
            >
              <Share2 className="w-4 h-4 text-[#FF8C00]" />
              <span>अन्य सभी ऐप्स पर शेयर करें (System Share Drawer)</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
          <span>आधिकारिक हेल्पलाइन: 9450985355</span>
          <span>सवारी सेतु प्राइवेट लिमिटेड • प्रचार हब</span>
        </div>
      </div>
    </div>
  );
};
