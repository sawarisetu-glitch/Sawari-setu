import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  PhoneOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Logo } from './Logo';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Convert Float32Array channel to 16-bit mono PCM base64
function float32ToPcmBase64(float32Array: Float32Array): string {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16Array.buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'speaking' | 'listening' | 'error' | 'closed'
  >('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [spokenSubtitle, setSpokenSubtitle] = useState(
    'सवारी सेतु लाइव वॉइस साथी तैयार है। कृपया माइक में कुछ बोलें...'
  );

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isMutedRef = useRef(false);

  isMutedRef.current = isMuted;

  // Cleanup helper
  const cleanUpSession = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {}
      wsRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {}
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {}
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }
    nextStartTimeRef.current = 0;
  };

  const playPcmAudioChunk = (base64Data: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    try {
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
      }

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextStartTimeRef.current < now) {
        nextStartTimeRef.current = now + 0.05;
      }

      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;

      setConnectionStatus('speaking');
      setSpokenSubtitle('सवारी सेतु AI साथी बोल रहा है...');

      source.onended = () => {
        if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
          setConnectionStatus('listening');
          setSpokenSubtitle('माइक सुन रहा है... आप अपनी बात कहें।');
        }
      };
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      cleanUpSession();
      return;
    }

    setConnectionStatus('connecting');
    setErrorMessage('');
    setSpokenSubtitle('Gemini 3.8 Live API से लाइव वॉइस सत्र जोड़ा जा रहा है...');

    let isActive = true;

    async function initLiveSession() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!isActive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        mediaStreamRef.current = stream;

        // Input 16kHz context for sending to gemini-3.8-live
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        inputAudioCtxRef.current = inputCtx;

        // Output 24kHz context for model audio playback
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        outputAudioCtxRef.current = outputCtx;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/api/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isActive) return;
          console.log('[Sawari Setu] 📡 WebSocket connection established for Live Voice');
          setConnectionStatus('listening');
          setSpokenSubtitle('लाइव सत्र सक्रिय! आप हिंदी में कोई भी प्रश्न पूछ सकते हैं।');
        };

        ws.onmessage = (event) => {
          if (!isActive) return;
          try {
            const data = JSON.parse(event.data);
            if (data.error) {
              setErrorMessage(data.error);
              setConnectionStatus('error');
              return;
            }
            if (data.interrupted) {
              // User spoke over assistant -> clear queue
              if (outputAudioCtxRef.current) {
                nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
              }
              setConnectionStatus('listening');
              setSpokenSubtitle('माइक सुन रहा है... आप अपनी बात जारी रखें।');
              return;
            }
            if (data.audio) {
              playPcmAudioChunk(data.audio);
            }
          } catch (err) {
            console.error('Failed to parse websocket live data:', err);
          }
        };

        ws.onerror = (err) => {
          console.warn('[Live WebSocket] Connection error:', err);
          if (isActive) {
            setConnectionStatus('error');
            setErrorMessage('लाइव वॉइस सर्वर से जुड़ने में समस्या आई।');
          }
        };

        ws.onclose = () => {
          if (isActive) {
            setConnectionStatus('closed');
          }
        };

        // Stream mic input via ScriptProcessor
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
          }
          const channelData = e.inputBuffer.getChannelData(0);

          // Calculate approximate volume level
          let sum = 0;
          for (let i = 0; i < channelData.length; i += 16) {
            sum += Math.abs(channelData[i]);
          }
          const avg = sum / (channelData.length / 16);
          setAudioLevel(Math.min(100, Math.round(avg * 350)));

          const pcmBase64 = float32ToPcmBase64(channelData);
          wsRef.current.send(JSON.stringify({ audio: pcmBase64 }));
        };
      } catch (err: any) {
        console.error('Microphone or AudioContext init error:', err);
        if (isActive) {
          setConnectionStatus('error');
          setErrorMessage(
            err.name === 'NotAllowedError'
              ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें।'
              : 'ऑडियो डिवाइस शुरू करने में असमर्थ।'
          );
        }
      }
    }

    initLiveSession();

    return () => {
      isActive = false;
      cleanUpSession();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-zinc-950 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-100">लाइव वॉयस बातचीत</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Gemini 3.8 Live
                </span>
              </div>
              <p className="text-xs text-zinc-400">सवारी सेतु रीयल-टाइम AI साथी</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Pulse & Audio Waves */}
        <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* Animated Pulses */}
            {connectionStatus === 'speaking' ? (
              <>
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse" />
              </>
            ) : connectionStatus === 'listening' ? (
              <>
                <div
                  className="absolute rounded-full bg-amber-500/20 transition-all duration-75"
                  style={{
                    inset: `${Math.max(0, 16 - audioLevel / 4)}px`,
                    opacity: 0.3 + (audioLevel / 100) * 0.7,
                  }}
                />
              </>
            ) : null}

            <div
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border shadow-xl transition-all duration-300 ${
                connectionStatus === 'speaking'
                  ? 'bg-emerald-500 text-black border-emerald-300 scale-105'
                  : connectionStatus === 'listening'
                  ? isMuted
                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              {connectionStatus === 'speaking' ? (
                <Volume2 className="w-10 h-10 animate-bounce" />
              ) : isMuted ? (
                <MicOff className="w-10 h-10" />
              ) : (
                <Mic className="w-10 h-10 animate-pulse" />
              )}
            </div>
          </div>

          {/* Status Label */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'speaking'
                    ? 'bg-emerald-400 animate-pulse'
                    : connectionStatus === 'listening'
                    ? isMuted
                      ? 'bg-red-400'
                      : 'bg-amber-400 animate-ping'
                    : connectionStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-zinc-500'
                }`}
              />
              <span className="capitalize">
                {connectionStatus === 'speaking'
                  ? 'AI सहायक बोल रहा है (Speaking)'
                  : connectionStatus === 'listening'
                  ? isMuted
                    ? 'माइक म्यूट है (Muted)'
                    : 'लाइव सुन रहा है (Listening...)'
                  : connectionStatus === 'connecting'
                  ? 'कनेक्ट हो रहा है (Connecting...)'
                  : connectionStatus === 'error'
                  ? 'कनेक्शन त्रुटि (Error)'
                  : 'सत्र समाप्त'}
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-300 max-w-xs mx-auto pt-2">
              {spokenSubtitle}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left w-full">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Hindi prompt suggestions to say */}
          <div className="w-full text-left bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-3.5 space-y-2">
            <p className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              आप बोल सकते हैं:
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                "हजरतगंज से चारबाग का ऑटो किराया कितना है?"
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                "छोटा हाथी में 700 किलो माल ले जाना है।"
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-800/70 text-zinc-300">
                "ड्राइवर बनने के लिए क्या दस्तावेज चाहिए?"
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Action Controls */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              isMuted
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
            <span>{isMuted ? 'अनम्यूट करें' : 'माइक म्यूट करें'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>कॉल समाप्त करें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
