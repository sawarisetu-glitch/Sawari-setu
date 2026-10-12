import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Download,
  Sparkles,
  Share2,
  Globe,
  Layers,
  ArrowRight,
  PackageCheck,
  Laptop,
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios' | 'playstore' | 'pc'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showQr, setShowQr] = useState(true);

  // Dynamic live working URL of the application (ensures public access on any phone)
  const currentAppUrl = (() => {
    if (typeof window === 'undefined') return 'https://ais-pre-m2dhejcqpk2noml5e5nw7m-335155965595.asia-southeast1.run.app';
    const origin = window.location.origin || '';
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'https://ais-pre-m2dhejcqpk2noml5e5nw7m-335155965595.asia-southeast1.run.app';
    }
    // If running in private developer container (ais-dev-), convert to public shareable URL (ais-pre-)
    if (origin.includes('ais-dev-')) {
      return origin.replace('ais-dev-', 'ais-pre-');
    }
    return origin;
  })();

  useEffect(() => {
    // Check if app is already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // If browser hasn't fired beforeinstallprompt or on mobile, show the instant guide
      setActivePlatform('android');
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendToWhatsApp = (url: string) => {
    const text = encodeURIComponent(
      `🚖 *सवारी सेतु (Sawari Setu)* ऐप डाउनलोड लिंक:\n${url}\n\nसफर आसान • साथ सबका! इस लिंक को अपने मोबाइल में खोलें और 3-डॉट्स (⋮) दबाकर "Install App" चुनें।`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/sawari_setu_logo.jpg"
              alt="सवारी सेतु (Sawari Setu)"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg shadow-amber-500/20 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-white">
                  सवारी सेतु ऐप डाउनलोड केंद्र
                </h2>
                <span className="text-[10px] bg-[#FF8C00] text-black font-extrabold px-1.5 py-0.2 rounded-md">
                  PWA Live
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                सीधे अपने मोबाइल फोन पर इंस्टॉल करें या दोस्तों को शेयर करें
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm">
          {/* 1-Click Native Install Banner */}
          {!isInstalled && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-amber-500 text-black shadow-xl shadow-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Download className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-black text-sm">इस डिवाइस पर ऐप इंस्टॉल करें</h4>
                  <p className="text-xs font-semibold opacity-90">बिना प्ले स्टोर के सीधे फोन स्क्रीन पर जोड़ें</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full sm:w-auto px-5 py-2.5 bg-black text-white rounded-xl font-black text-xs hover:bg-zinc-900 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#FF8C00]" />
                <span>अभी इंस्टॉल करें</span>
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">
                ✓ सवारी सेतु ऐप आपके डिवाइस में सफलतापूर्वक इंस्टॉल है!
              </span>
            </div>
          )}

          {/* Primary App Link Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-900 border-2 border-amber-500/50 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> आधिकारिक एक्टिव लिंक
              </span>
              <span className="text-[11px] text-zinc-400">सभी मोबाइलों में खुलेगा</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/80 border border-zinc-700/80 font-mono text-[11px] sm:text-xs text-amber-300 break-all select-all flex items-center justify-between gap-2">
              <span className="truncate">{currentAppUrl}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Direct Install Action */}
              <button
                type="button"
                onClick={handleNativeInstall}
                className="py-2.5 px-2 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 text-center cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>इंस्टॉल करें</span>
              </button>

              {/* Direct Open Link */}
              <a
                href={currentAppUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all text-center cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>ब्राउज़र में खोलें</span>
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={() => handleCopy(currentAppUrl)}
                className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">कॉपी हुआ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-300" />
                    <span>लिंक कॉपी</span>
                  </>
                )}
              </button>

              {/* Send to WhatsApp */}
              <button
                type="button"
                onClick={() => handleSendToWhatsApp(currentAppUrl)}
                className="py-2.5 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="व्हाट्सएप पर लिंक भेजें"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Helper Notice for Sharing */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
              <span className="text-base shrink-0">📲</span>
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">दूसरों के मोबाइल पर लिंक खोलने के लिए:</strong>
                यह लिंक (<span className="text-amber-100 font-mono font-semibold">{currentAppUrl}</span>) किसी भी फोन पर बिना Google लॉगिन के सीधे खुलता है। AI Studio के ऊपर मौजूद <strong>'Share'</strong> बटन दबाकर इस लिंक को हमेशा के लिए पब्लिक कर सकते हैं।
              </div>
            </div>
          </div>

          {/* QR Code Quick Scan Card */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center gap-2">
            <button
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>{showQr ? 'QR कोड छिपाएं' : 'फोन से स्कैन करके तुरंत खोलने के लिए QR कोड देखें'}</span>
            </button>

            {showQr && (
              <div className="mt-2 p-3 bg-white rounded-2xl shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-150">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    currentAppUrl
                  )}`}
                  alt="Sawari Setu QR Code"
                  className="w-40 h-40 object-contain"
                />
                <p className="text-[11px] text-zinc-800 font-extrabold mt-2">
                  फोन कैमरे या Google Lens से स्कैन करें
                </p>
              </div>
            )}
          </div>

          {/* Platform Step-by-Step Installation Tabs */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#FF8C00]" />
                <span>डाउनलोड व इंस्टॉलेशन गाइड (चरण-दर-चरण):</span>
              </span>
            </div>

            {/* Platform Selector Buttons */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setActivePlatform('android')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'android'
                    ? 'bg-[#FF8C00] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🤖 Android
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('ios')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'ios'
                    ? 'bg-[#FF8C00] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🍏 iPhone
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('pc')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'pc'
                    ? 'bg-[#FF8C00] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                💻 Computer
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform('playstore')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  activePlatform === 'playstore'
                    ? 'bg-[#FF8C00] text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                📦 Play Store
              </button>
            </div>

            {/* Content for Android */}
            {activePlatform === 'android' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs animate-in fade-in">
                <h5 className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>Android फोन में Google Chrome से इंस्टॉल करने के 3 आसान स्टेप:</span>
                </h5>
                <div className="space-y-2 text-zinc-300 text-[11px] sm:text-xs">
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <p>
                      ऊपर दिए गए लिंक को अपने Android फोन के <strong>Google Chrome</strong> ब्राउज़र में खोलें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <p>
                      Chrome के ऊपर दाएँ कोने में <strong>3 डॉट्स (⋮)</strong> पर टैप करें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <p>
                      <strong>"Install App" (ऐप इंस्टॉल करें)</strong> या <strong>"Add to Home screen" (होम स्क्रीन पर जोड़ें)</strong> पर क्लिक करें।
                    </p>
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold">
                  ✓ ऐप आपके फ़ोन के होम स्क्रीन पर असली "सवारी सेतु" लोगो के साथ ऐप की तरह चलेगा!
                </div>
              </div>
            )}

            {/* Content for iPhone */}
            {activePlatform === 'ios' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs animate-in fade-in">
                <h5 className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <span>Apple iPhone में Safari ब्राउज़र से इंस्टॉल करने का तरीका:</span>
                </h5>
                <div className="space-y-2 text-zinc-300 text-[11px] sm:text-xs">
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <p>
                      लिंक को अपने iPhone के <strong>Safari</strong> ब्राउज़र में खोलें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <p>
                      नीचे बीच में दिए गए <strong>Share (⎋ / तीर वाला चौकोर)</strong> बटन पर टैप करें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <p>
                      नीचे स्क्रॉल करें और <strong>"Add to Home Screen" (होम स्क्रीन पर जोड़ें)</strong> चुनकर ऊपर 'Add' दबाएं।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content for PC / Laptop */}
            {activePlatform === 'pc' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs animate-in fade-in">
                <h5 className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-[#FF8C00]" />
                  <span>कंप्यूटर / लैपटॉप पर डेस्कटॉप ऐप की तरह चलाएं:</span>
                </h5>
                <div className="space-y-2 text-zinc-300 text-[11px] sm:text-xs">
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <p>
                      अपने कंप्यूटर पर Google Chrome या Microsoft Edge में यह लिंक खोलें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <p>
                      ऊपर URL एड्रेस बार के दाएँ कोने में कंप्यूटर स्क्रीन आइकन <strong>"Install Sawari Setu"</strong> पर क्लिक करें।
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content for Play Store */}
            {activePlatform === 'playstore' && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5 text-xs animate-in fade-in">
                <h5 className="font-extrabold text-amber-400 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-emerald-400" />
                  <span>आम जनता के लिए Google Play Store पर APK / AAB कैसे पब्लिश करें:</span>
                </h5>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  यह सवारी सेतु ऐप <strong>100% PWA-रेडी (Manifest + Service Worker + Icons)</strong> है। इसे सीधे Google Play Store पर पब्लिश करने के लिए:
                </p>
                <div className="space-y-2 text-zinc-300 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      1
                    </span>
                    <p>
                      मुफ्त वेबसाइट <strong>PWABuilder (www.pwabuilder.com)</strong> खोलें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      2
                    </span>
                    <p>
                      ऊपर दिया गया पब्लिक लिंक <code className="text-amber-300 font-mono text-[10px]">{currentAppUrl}</code> दर्ज करें और 'Start' दबाएं।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      3
                    </span>
                    <p>
                      <strong>"Package for Android"</strong> पर क्लिक करके अपनी <strong>.aab / .apk फ़ाइल</strong> 1 मिनट में डाउनलोड करें।
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      4
                    </span>
                    <p>
                      इस फ़ाइल को अपने <strong>Google Play Console</strong> पर अपलोड करके पूरे भारत व दुनिया भर के लोगों के लिए लाइव कर दें।
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% PWA सिक्योर SSL एन्क्रिप्टेड
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
