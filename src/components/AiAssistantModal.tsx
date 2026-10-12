import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RefreshCw,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Search,
  Globe,
  Radio,
  ExternalLink,
  Zap,
  Cpu,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { openWhatsAppHelpline } from '../utils/storage';
import { Logo } from './Logo';
import { LiveVoiceModal } from './LiveVoiceModal';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: string;
}

export type ChatbotRole = 'general' | 'driver_support' | 'route_fares' | 'logistics';
export type ModelOption = 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview';
export type GroundingOption = 'none' | 'maps' | 'search';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  mapLinks?: Array<{ title: string; uri: string }>;
  searchSources?: Array<{ title: string; uri: string }>;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  currentContext = 'Home',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'नमस्ते! मैं "सवारी सेतु" का आधिकारिक बहुप्रतिभाशाली AI साथी (Gemini Multi-Talent Assistant) हूँ।\n\nसवारी बुकिंग (Bike, Auto, Car), माल परिवहन (छोटा हाथी/ट्रक), सटीक किराया, Google Maps रूट या ड्राइवर कमाई से जुड़ा कोई भी सवाल पूछें!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Gemini Model & Role & Grounding State
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('general');
  const [modelOption, setModelOption] = useState<ModelOption>('gemini-3.5-flash');
  const [groundingOption, setGroundingOption] = useState<GroundingOption>('none');

  // Audio Recording with gemini-3.5-transcribe
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live Voice Modal (gemini-3.8-live)
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roleLabels: Record<ChatbotRole, { name: string; badge: string; desc: string }> = {
    general: {
      name: 'सवारी व सेवा साथी',
      badge: '🌟 मुख्य',
      desc: 'सवारी, माल भाड़ा, आपातकालीन SOS सुरक्षा व नीतियां',
    },
    driver_support: {
      name: 'ड्राइवर पार्टनर सपोर्ट',
      badge: '🚖 ड्राइवर',
      desc: 'दैनिक पेआउट, इंसेंटिव, DL/RC सत्यापन व आरटीओ नियम',
    },
    route_fares: {
      name: 'मार्ग व किराया विश्लेषक',
      badge: '🗺️ रूट',
      desc: 'सटीक किराया ब्रेकडाउन, टोल और कम ट्रैफिक वाले रास्ते',
    },
    logistics: {
      name: 'माल परिवहन सलाहकार',
      badge: '📦 माल',
      desc: 'Tata Ace (छोटा हाथी), ट्रक्स और पारगमन बीमा कवरेज',
    },
  };

  const quickPromptsByRole: Record<ChatbotRole, string[]> = {
    general: [
      'हजरतगंज से चारबाग का ऑटो/बाइक किराया?',
      'छोटा हाथी में 700 किलो सामान ले जाने का क्या नियम है?',
      'आपातकालीन SOS सुरक्षा कैसे काम करती है?',
    ],
    driver_support: [
      'ड्राइवर बनने के लिए कौन से दस्तावेज अनिवार्य हैं?',
      'दैनिक कमाई और UPI भुगतान कैसे मिलता है?',
      'कमर्शियल आरसी और परमिट के क्या नियम हैं?',
    ],
    route_fares: [
      'सिविल लाइंस से रेलवे स्टेशन का न्यूनतम किराया क्या है?',
      'रात के समय यात्रा में कोई अतिरिक्त चार्ज लगता है क्या?',
      'प्रयागराज से वाराणसी का कार रूट और अनुमानित टोल बताएं।',
    ],
    logistics: [
      'छोटा हाथी (Tata Ace) में अधिकतम कितना वजन लोड कर सकते हैं?',
      'माल पारगमन बीमा (Transit Insurance) का क्या क्लेम प्रोसेस है?',
      '14 फीट व 32 फीट कंटेनर ट्रक किन रूटों पर उपलब्ध हैं?',
    ],
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isTranscribing]);

  if (!isOpen) return null;

  // 1. Microphone Audio Recording -> gemini-3.5-transcribe
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone permission error:', err);
      alert('माइक्रोफ़ोन एक्सेस उपलब्ध नहीं है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।');
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeAudio = async (blob: Blob) => {
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

        const response = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: 'audio/webm',
          }),
        });

        const data = await response.json();
        if (data.transcript) {
          setInputValue(data.transcript);
          // Auto-send transcribed prompt
          handleSendMessage(data.transcript);
        }
        setIsTranscribing(false);
      };
    } catch (transcribeErr) {
      console.error('Transcription failed:', transcribeErr);
      setIsTranscribing(false);
    }
  };

  // 2. Send multi-turn chat message with role and grounding
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get browser location if available for Google Maps grounding
      let userLocation: { latitude: number; longitude: number } | undefined;
      if (groundingOption === 'maps' && 'geolocation' in navigator) {
        try {
          const pos: any = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
              timeout: 3000,
            });
          });
          if (pos?.coords) {
            userLocation = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            };
          }
        } catch {}
      }

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: currentContext,
          chatbotRole: selectedRole,
          modelPreference: modelOption,
          grounding: groundingOption,
          userLocation,
          history: messages.slice(-10).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      const replyText =
        data.reply ||
        data.fallback ||
        'नमस्ते! सवारी सेतु सेवा से जुड़ने के लिए धन्यवाद। अधिक जानकारी हेतु हेल्पलाइन 9450985355 पर संपर्क करें।';

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || modelOption,
        mapLinks: data.mapLinks,
        searchSources: data.searchSources,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If speech synthesis enabled
      if ('speechSynthesis' in window && isSpeaking) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText.slice(0, 160));
        utterance.lang = 'hi-IN';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Error contacting AI chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'नमस्ते! अभी नेटवर्क व्यस्त है। आपातकालीन सहायता या सीधी बुकिंग हेतु 24x7 हेल्पलाइन 9450985355 पर कॉल करें।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-xl h-[92vh] max-h-[740px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
          {/* Top Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF8C00] to-amber-600 p-2 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5 text-black animate-pulse" />
                <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">सवारी सेतु AI चैटबॉट</h3>
                  <span className="text-[10px] bg-amber-500/20 text-[#FF8C00] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {modelOption}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  {roleLabels[selectedRole].name} • मल्टी-टर्न चैट
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Button to Launch Real-time Live Voice Conversation */}
              <button
                onClick={() => setIsLiveVoiceOpen(true)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="लाइव वॉयस बातचीत शुरू करें (Gemini 3.8 Live API)"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span className="hidden sm:inline">लाइव वॉयस</span>
              </button>

              {/* TTS Readout toggle */}
              <button
                onClick={() => setIsSpeaking(!isSpeaking)}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  isSpeaking
                    ? 'bg-amber-500/20 text-[#FF8C00] border-amber-500/40'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                }`}
                title={isSpeaking ? 'बोलकर पढ़ना चालू है' : 'बोलकर पढ़ना बंद है'}
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role & Grounding Selector Bar */}
          <div className="px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Roles Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-zinc-500 text-[10px] uppercase font-bold shrink-0">भूमिका:</span>
              {(Object.keys(roleLabels) as ChatbotRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-2.5 py-1 rounded-lg font-medium text-[11px] shrink-0 transition-all ${
                    selectedRole === r
                      ? 'bg-[#FF8C00] text-black font-bold shadow-sm'
                      : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 border border-zinc-700/50'
                  }`}
                >
                  {roleLabels[r].badge} {roleLabels[r].name}
                </button>
              ))}
            </div>

            {/* Model & Grounding Controls */}
            <div className="flex items-center gap-2">
              {/* Model Choice */}
              <select
                value={modelOption}
                onChange={(e) => setModelOption(e.target.value as ModelOption)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-[11px] rounded-lg px-2 py-1 outline-none font-medium"
                title="Gemini AI मॉडल चुनें"
              >
                <option value="gemini-3.5-flash">⚡ gemini-3.5-flash (अनुशंसित)</option>
                <option value="gemini-3.1-flash-lite">🚀 gemini-3.1-flash-lite (सुपरफास्ट)</option>
                <option value="gemini-3.1-pro-preview">🧠 gemini-3.1-pro-preview (जटिल कार्य)</option>
              </select>

              {/* Grounding Toggle */}
              <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 border border-zinc-700 text-[11px]">
                <button
                  onClick={() => setGroundingOption('none')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    groundingOption === 'none'
                      ? 'bg-zinc-700 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  title="साधारण मोड"
                >
                  सामान्य
                </button>
                <button
                  onClick={() => setGroundingOption('maps')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                    groundingOption === 'maps'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-emerald-400'
                  }`}
                  title="Google Maps डेटा से सटीक स्थान जानकारी"
                >
                  <MapPin className="w-3 h-3 text-emerald-300" />
                  मैप्स
                </button>
                <button
                  onClick={() => setGroundingOption('search')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                    groundingOption === 'search'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-zinc-400 hover:text-blue-400'
                  }`}
                  title="Google Search डेटा से लाइव वेब जानकारी"
                >
                  <Globe className="w-3 h-3 text-blue-300" />
                  सर्च
                </button>
              </div>
            </div>
          </div>

          {/* Active Grounding Indicator */}
          {groundingOption !== 'none' && (
            <div className="px-4 py-1.5 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-300">
                {groundingOption === 'maps' ? (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <strong>Google Maps Grounding सक्रिय:</strong> वास्तविक स्थान व मैप्स लिंक प्राप्त होंगे।
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <strong>Google Search Grounding सक्रिय:</strong> लाइव वेब तथ्य व स्रोत लिंक प्राप्त होंगे।
                  </>
                )}
              </span>
              <span className="text-[10px] text-zinc-400">gemini-3.5-flash</span>
            </div>
          )}

          {/* Scrollable Chat History Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="shrink-0 mt-0.5">
                      <Logo size="xs" imageOnly={true} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-amber-600 to-[#FF8C00] text-black font-medium rounded-tr-sm'
                        : 'bg-zinc-900 border border-zinc-800/90 text-zinc-100 rounded-tl-sm whitespace-pre-line'
                    }`}
                  >
                    <p className="text-xs sm:text-sm leading-relaxed">{msg.text}</p>

                    {/* Google Maps Grounding Links */}
                    {msg.mapLinks && msg.mapLinks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 space-y-1.5">
                        <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          सत्यापित गूगल मैप्स स्थान (Google Maps Places):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.mapLinks.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-[11px] text-emerald-200 transition-all font-medium"
                            >
                              <span>{link.title}</span>
                              <ExternalLink className="w-3 h-3 text-emerald-400" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Google Search Sources Links */}
                    {msg.searchSources && msg.searchSources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 space-y-1.5">
                        <p className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-blue-400" />
                          सर्च संदर्भ स्रोत (Google Search Sources):
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.searchSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-700/50 text-[11px] text-blue-200 transition-all font-medium"
                            >
                              <span className="truncate max-w-[200px]">{source.title}</span>
                              <ExternalLink className="w-3 h-3 text-blue-400 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[9px] mt-1.5 text-zinc-500">
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && !isUser && (
                        <span className="text-zinc-500 font-mono">{msg.modelUsed}</span>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 text-xs border border-zinc-700">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTranscribing && (
              <div className="flex gap-2.5 items-center">
                <div className="shrink-0">
                  <Logo size="xs" imageOnly={true} />
                </div>
                <div className="bg-zinc-900 border border-amber-500/40 rounded-2xl px-3.5 py-2.5 text-xs text-amber-300 flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                  Gemini 3.5 Transcribe द्वारा आपकी आवाज ट्रांसक्राइब हो रही है...
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="shrink-0">
                  <Logo size="xs" imageOnly={true} />
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3.5 py-2.5 text-xs text-amber-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF8C00]" />
                  सवारी सेतु AI सोच रहा है... ({modelOption})
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Hindi Prompts for Selected Role */}
          <div className="px-3 py-2 bg-zinc-900/60 border-t border-zinc-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPromptsByRole[selectedRole].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-amber-400 hover:border-amber-500/40 transition-all shrink-0"
              >
                ✨ {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar with Transcribe Audio (gemini-3.5-transcribe) */}
          <div className="p-3 bg-zinc-950 border-t border-zinc-800">
            {isRecording && (
              <div className="mb-2 p-2 rounded-xl bg-red-950/60 border border-red-800/60 flex items-center justify-between text-xs text-red-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>माइक्रोफ़ोन सुन रहा है... (बोलना पूरा होने पर रोकें)</span>
                </div>
                <button
                  type="button"
                  onClick={stopRecordingAudio}
                  className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px]"
                >
                  ट्रांसक्राइब करें (gemini-3.5-transcribe)
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic button using gemini-3.5-transcribe */}
              <button
                type="button"
                onClick={isRecording ? stopRecordingAudio : startRecordingAudio}
                className={`p-2.5 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-red-600 text-white border-red-500 animate-pulse'
                    : 'bg-zinc-900 text-zinc-400 hover:text-amber-400 border-zinc-800'
                }`}
                title={
                  isRecording
                    ? 'रिकॉर्डिंग समाप्त करें व ट्रांसक्राइब करें'
                    : 'माइक से बोलें (gemini-3.5-transcribe)'
                }
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`${roleLabels[selectedRole].name} से पूछें...`}
                className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all"
              />

              <button
                type="submit"
                disabled={isLoading || isTranscribing || !inputValue.trim()}
                className="p-2.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 disabled:opacity-40 disabled:hover:bg-[#FF8C00] text-black font-bold transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Live Voice Modal (Gemini 3.8 Live API) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
      />
    </>
  );
};
