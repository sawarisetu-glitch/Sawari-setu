import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  Car,
  Bike,
  Footprints,
  Users,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Navigation,
  MapPin,
  Send,
} from 'lucide-react';
import { RideMode } from '../types';
import confetti from 'canvas-confetti';

interface VoiceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoiceBooking: (booking: {
    pickup: string;
    destination: string;
    mode: RideMode;
    transcript: string;
    directConfirm?: boolean;
  }) => void;
}

// Common voice samples for user convenience
const SAMPLE_HINDI_PROMPTS = [
  'दशमी का बाग से सिविल लाइंस, ऑटो रिक्शा चाहिए',
  'सिरसा से उरवा ब्लॉक, बाइक टैक्सी बुक करो',
  'प्रयागराज जंक्शन से मेजा खास, 4 सीटर कार',
  'सिरसा मार्केट से दवा लानी है, वॉकर भेजो',
  'हंडिया से वाराणसी कैंट, 7 सीटर कार चाहिए',
  'नैनी से हंडिया, ई-रिक्शा चाहिए',
];

export const VoiceBookingModal: React.FC<VoiceBookingModalProps> = ({
  isOpen,
  onClose,
  onApplyVoiceBooking,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [useGeminiTranscribe, setUseGeminiTranscribe] = useState(true);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState<{
    pickup: string;
    destination: string;
    mode: RideMode;
    modeName: string;
  } | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('माइक सुन रहा है... कृपया अपनी यात्रा का विवरण बोलें');
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const activeStreamRef = useRef<MediaStream | null>(null);

  // Hindi TTS Voice synthesizer helper
  const speakHindi = (text: string) => {
    if (isTtsMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Find best Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.lang.includes('Hindi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error:', e);
    }
  };

  // Parse Hindi / Hinglish voice query to identify pickup, destination & vehicle
  const parseVoiceIntent = (text: string) => {
    const lower = text.toLowerCase();

    // 1. Detect Vehicle Mode
    let detectedMode: RideMode = 'auto';
    let modeName = 'ऑटो रिक्शा';

    if (
      lower.includes('बाइक') ||
      lower.includes('bike') ||
      lower.includes('मोटरसाइकिल') ||
      lower.includes('मोटर साइकिल') ||
      lower.includes('दो पहिया')
    ) {
      detectedMode = 'bike';
      modeName = 'मोटरसाइकिल (Bike Taxi)';
    } else if (
      lower.includes('ई-रिक्शा') ||
      lower.includes('रिक्शा') ||
      lower.includes('erickshaw') ||
      lower.includes('rickshaw') ||
      lower.includes('ई रिक्शा') ||
      lower.includes('टोटो')
    ) {
      if (lower.includes('शेयर') || lower.includes('share') || lower.includes('सवारी')) {
        detectedMode = 'erickshaw_share';
        modeName = 'ई-रिक्शा शेयर (Share)';
      } else {
        detectedMode = 'erickshaw_direct';
        modeName = 'ई-रिक्शा डायरेक्ट (Full)';
      }
    } else if (
      lower.includes('7 सीटर') ||
      lower.includes('6 सीटर') ||
      lower.includes('suv') ||
      lower.includes('स्कॉर्पियो') ||
      lower.includes('बोलेरो') ||
      lower.includes('इनोवा') ||
      lower.includes('अर्टिगा') ||
      lower.includes('बड़ी कार')
    ) {
      detectedMode = 'car_6_7';
      modeName = '6 व 7 सीटर SUV';
    } else if (
      lower.includes('कार') ||
      lower.includes('car') ||
      lower.includes('कैब') ||
      lower.includes('टैक्सी') ||
      lower.includes('sedan') ||
      lower.includes('मिनी') ||
      lower.includes('स्वीफ्ट') ||
      lower.includes('वैगनआर')
    ) {
      detectedMode = 'car_4_5';
      modeName = '4 व 5 सीटर कार (Mini / Sedan)';
    } else if (lower.includes('ऑटो') || lower.includes('auto')) {
      detectedMode = 'auto';
      modeName = 'ऑटो रिक्शा (Auto)';
    }

    // 2. Detect Locations ("X से Y" or "from X to Y" or "X जाना है")
    let pickup = '';
    let destination = '';

    const stopWordsRegex = /(जाना|तक|चाहिए|बुक|करो|कर दीजिए|है|कार|ऑटो|बाइक|टैक्सी|रिक्शा|वॉकर|भेजो|लगाओ|चलना है)/gi;

    if (text.includes(' से ') && (text.includes(' जाना ') || text.includes(' तक ') || text.includes(' के लिए ') || text.includes(' चलना '))) {
      const parts = text.split(' से ');
      pickup = parts[0].replace(/(मुझे|हमको|कृपया|जरा)/gi, '').trim();
      const afterSe = parts[1] || '';
      destination = afterSe.replace(stopWordsRegex, '').trim();
    } else if (text.includes(' से ')) {
      const parts = text.split(' से ');
      pickup = parts[0].replace(/(मुझे|हमको|कृपया|जरा)/gi, '').trim();
      destination = (parts[1] || '').replace(stopWordsRegex, '').trim();
    } else if (text.includes(' to ') || text.includes(' To ')) {
      const parts = text.split(/ to /i);
      pickup = parts[0].replace(/from/gi, '').trim();
      destination = (parts[1] || '').replace(stopWordsRegex, '').trim();
    } else if (text.includes(' जाना है ') || text.includes(' जाना ') || text.includes(' चलो ')) {
      // Direct destination
      pickup = 'दशमी का बाग, सिरसा टाउन, प्रयागराज';
      destination = text.replace(/(मुझे|हमको|कृपया|जाना है|जाना|चलो|कार|ऑटो|बाइक|चाहिए)/gi, '').trim();
    } else {
      // Fallback
      pickup = 'दशमी का बाग, सिरसा टाउन, प्रयागराज';
      destination = text.replace(stopWordsRegex, '').trim();
    }

    if (!pickup || pickup.length < 2) pickup = 'दशमी का बाग, सिरसा टाउन, प्रयागराज';
    if (!destination || destination.length < 2) destination = 'सिविल लाइंस, प्रयागराज';

    const parsed = {
      pickup,
      destination,
      mode: detectedMode,
      modeName,
    };

    setParsedData(parsed);
    setFeedbackMsg(`पहचान लिया गया: ${parsed.pickup} से ${parsed.destination} (${modeName})`);
    speakHindi(`पिकअप ${parsed.pickup}, गंतव्य ${parsed.destination}, ${modeName}`);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setFeedbackMsg('ब्राउज़र में सीधे स्पीच समर्थित नहीं है। कृपया नीचे दिए गए उदाहरणों पर टैप करें।');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedbackMsg('सुन रहे हैं... कृपया स्पष्ट बोलें (जैसे: "सिरसा से सिविल लाइंस, कार चाहिए")');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        parseVoiceIntent(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setFeedbackMsg('माइक्रोफ़ोन अनुमति आवश्यक है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें या नीचे उदाहरण चुनें।');
        } else {
          setFeedbackMsg('आवाज पकड़ने में समस्या हुई। कृपया दोबारा बोलें या नीचे दिए गए सुझाव चुनें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;

      // Auto start listening after modal opens smoothly
      const timer = setTimeout(() => {
        try {
          recognition.start();
        } catch (e) {
          console.warn('Auto start speech error:', e);
        }
      }, 350);

      return () => {
        clearTimeout(timer);
        try {
          recognition.abort();
        } catch {}
      };
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setSpeechSupported(false);
    }
  }, [isOpen]);

  const startGeminiAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStreamRef.current = stream;
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioToGeminiTranscribe(blob);
      };

      mediaRecorder.start();
      setIsListening(true);
      setFeedbackMsg('माइक सुन रहा है... (बोलना समाप्त होने पर दोबारा टैप करें)');
    } catch (err) {
      console.warn('Mic access error, falling back to Web Speech:', err);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch {}
      }
    }
  };

  const stopGeminiAudioRecord = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      setIsTranscribing(true);
      setFeedbackMsg('Gemini 3.5 Transcribe द्वारा आपकी आवाज ट्रांसक्राइब हो रही है...');
    }
  };

  const sendAudioToGeminiTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        if (!base64Data) {
          setIsTranscribing(false);
          return;
        }

        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
        });
        const data = await res.json();
        const text = data.transcript || '';
        if (text) {
          setTranscript(text);
          parseVoiceIntent(text);
          setFeedbackMsg(`सटीक ट्रांसक्राइब: "${text}"`);
        } else {
          setFeedbackMsg('आवाज समझने में समस्या हुई। कृपया पुनः बोलें।');
        }
        setIsTranscribing(false);
      };
    } catch (e) {
      console.warn('Transcription error:', e);
      setIsTranscribing(false);
    }
  };

  const handleToggleListening = () => {
    if (useGeminiTranscribe && typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      if (isListening) {
        stopGeminiAudioRecord();
      } else {
        startGeminiAudioRecord();
      }
      return;
    }

    if (!recognitionRef.current) {
      handleSimulateVoice(SAMPLE_HINDI_PROMPTS[0]);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Recognition start error:', e);
        }
      }
    }
  };

  const handleSimulateVoice = (sampleText: string) => {
    setTranscript(sampleText);
    parseVoiceIntent(sampleText);
  };

  const handleApplyForm = () => {
    if (!parsedData) return;
    onApplyVoiceBooking({
      pickup: parsedData.pickup,
      destination: parsedData.destination,
      mode: parsedData.mode,
      transcript: transcript || 'बोलकर सवारी बुक की गई',
      directConfirm: false,
    });
    onClose();
  };

  const handleDirectConfirm = () => {
    if (!parsedData) return;
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onApplyVoiceBooking({
      pickup: parsedData.pickup,
      destination: parsedData.destination,
      mode: parsedData.mode,
      transcript: transcript || 'बोलकर सवारी बुक की गई',
      directConfirm: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FF8C00]/20 text-[#FF8C00] flex items-center justify-center border border-amber-500/40">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>बोलकर सवारी बुक करें (Voice Booking)</span>
                <span className="text-[10px] bg-[#FF8C00]/20 text-[#FF8C00] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                  gemini-3.5-transcribe
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                टाइप करने की जरूरत नहीं — बस अपनी भाषा में बोलें
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsTtsMuted(!isTtsMuted)}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
              title={isTtsMuted ? 'आवाज चालू करें' : 'आवाज म्यूट करें'}
            >
              {isTtsMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-center">
          {/* Animated Glowing Mic Circle */}
          <div className="relative inline-block my-2">
            {isListening && (
              <>
                <div className="absolute -inset-4 rounded-full bg-amber-500/20 animate-ping" />
                <div className="absolute -inset-2 rounded-full bg-orange-500/30 animate-pulse" />
              </>
            )}

            <button
              type="button"
              onClick={handleToggleListening}
              className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 mx-auto ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 text-white shadow-amber-500/40 scale-105'
                  : 'bg-gradient-to-tr from-[#FF8C00] to-amber-500 text-black hover:brightness-110 shadow-orange-500/30'
              }`}
            >
              <Mic className={`w-10 h-10 ${isListening ? 'animate-bounce' : ''}`} />
              <span className="text-[10px] font-black uppercase mt-1 tracking-wider">
                {isListening ? 'सुन रहे हैं...' : 'माइक दबाएं'}
              </span>
            </button>
          </div>

          <div>
            <h4 className="text-xs font-black text-white">
              {isListening ? '🎙️ आपकी आवाज रिकॉर्ड हो रही है...' : 'माइक दबाकर अपनी यात्रा बोलें'}
            </h4>
            <p className="text-[11px] text-zinc-400 max-w-sm mx-auto mt-0.5">
              {feedbackMsg}
            </p>
          </div>

          {/* Transcript Display Box */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left min-h-[64px] space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              आपकी आवाज (Live Transcript):
            </span>
            <p className="text-xs font-semibold text-white">
              {transcript || (
                <span className="text-zinc-500 italic">
                  उदा. "दशमी का बाग से सिविल लाइंस, 4 सीटर कार चाहिए"
                </span>
              )}
            </p>
          </div>

          {/* Parsed Extracted Details Preview */}
          {parsedData && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-zinc-950 border border-emerald-500/50 text-left space-y-2.5 animate-in zoom-in-95 duration-200 shadow-lg">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20">
                <span className="text-[11px] font-black text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>सवारी सेतु AI द्वारा पहचाना गया:</span>
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  {parsedData.modeName}
                </span>
              </div>

              <div className="text-xs space-y-2 text-zinc-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">पिकअप स्थान:</span>
                    <strong className="text-white">{parsedData.pickup}</strong>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-[#FF8C00] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-zinc-400 block">गंतव्य स्थान:</span>
                    <strong className="text-white">{parsedData.destination}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-zinc-800 text-[11px] text-zinc-400">
                  <span>वाहन: <strong className="text-amber-400">{parsedData.modeName}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-400">टोल टैक्स शामिल</span>
                </div>
              </div>
            </div>
          )}

          {/* Sample Prompts for 1-Click Try */}
          <div className="text-left space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block px-1">
              💡 या इनमें से किसी एक सुझाव पर क्लिक करें:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {SAMPLE_HINDI_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSimulateVoice(prompt)}
                  className="p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-[11px] text-zinc-300 hover:text-white transition-all text-left flex items-center gap-1.5 group"
                >
                  <Sparkles className="w-3 h-3 text-[#FF8C00] shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">"{prompt}"</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs"
          >
            रद्द करें
          </button>

          <button
            type="button"
            onClick={handleApplyForm}
            disabled={!parsedData}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
              parsedData
                ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 cursor-not-allowed'
            }`}
          >
            <span>सवारी फॉर्म में भरें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDirectConfirm}
            disabled={!parsedData}
            className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all ${
              parsedData
                ? 'bg-[#FF8C00] hover:bg-orange-600 text-black shadow-amber-500/25'
                : 'bg-zinc-850 text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>तत्काल बोलकर बुक करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
