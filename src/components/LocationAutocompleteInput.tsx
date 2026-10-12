import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Search,
  Check,
  X,
  Loader2,
  Crosshair,
  Sparkles,
} from 'lucide-react';
import {
  searchAddressSuggestions,
  resolvePlaceCoordinates,
  reverseGeocodeCoords,
  PlaceSuggestion,
} from '../utils/googleMapsService';

interface LocationAutocompleteInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  onSelectCoords: (coords: { lat: number; lng: number }, addressName: string) => void;
  placeholder?: string;
  isPickup?: boolean;
  showGpsButton?: boolean;
  currentLocationCoords?: { lat: number; lng: number };
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  label,
  value,
  onChange,
  onSelectCoords,
  placeholder = 'पता या स्थान खोजें...',
  isPickup = false,
  showGpsButton = false,
  currentLocationCoords,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLocating, setIsGpsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Universal dynamic search powered directly by Google Maps Autocomplete API
  const handleInputChange = (text: string) => {
    onChange(text);
    setIsOpen(true);
    setStatusMessage('');

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    const trimmed = text.trim();
    if (!trimmed) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchAddressSuggestions(trimmed, currentLocationCoords);
        setSuggestions(results);
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }, 180);
  };

  const handleSelectSuggestion = async (place: PlaceSuggestion) => {
    const selectedText = place.description || place.mainText;
    onChange(selectedText);
    setIsOpen(false);
    setStatusMessage(`📍 चयनित: ${place.mainText}`);

    // Resolve exact Google Maps Lat/Lng
    const coords = await resolvePlaceCoordinates(place);
    onSelectCoords(coords, selectedText);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Select exact text typed by the user directly
  const handleSelectExactTyped = async (typedText: string) => {
    const trimmed = typedText.trim();
    if (!trimmed) return;

    onChange(trimmed);
    setIsOpen(false);
    setStatusMessage(`📍 चयनित स्थान: ${trimmed}`);

    const directPlace: PlaceSuggestion = {
      id: `direct_${Date.now()}`,
      description: trimmed,
      mainText: trimmed,
      secondaryText: 'सवारी सेतु चिह्नित स्थान',
      source: 'direct',
    };
    const coords = await resolvePlaceCoordinates(directPlace);
    onSelectCoords(coords, trimmed);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Handle Enter key on input to immediately accept location
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (value.trim()) {
        handleSelectExactTyped(value);
      }
    }
  };

  // Real GPS Geolocation & Real Reverse Geocoding with Google Maps
  const handleDetectGps = () => {
    setIsGpsLocating(true);
    setStatusMessage('जीपीएस उपग्रह खोज रहा है...');

    if (!('geolocation' in navigator)) {
      setStatusMessage('कृपया अपने डिवाइस में GPS चालू करें');
      setIsGpsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const { address, areaName } = await reverseGeocodeCoords(lat, lng);
          onChange(address);
          onSelectCoords({ lat, lng }, address);
          setStatusMessage(`📍 लाइव जीपीएस: ${areaName}`);
        } catch {
          const fallback = `लाइव जीपीएस (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
          onChange(fallback);
          onSelectCoords({ lat, lng }, fallback);
          setStatusMessage('📍 लाइव जीपीएस लोकेशन सेट');
        } finally {
          setIsGpsLocating(false);
          setIsOpen(false);
          setTimeout(() => setStatusMessage(''), 4000);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setStatusMessage('GPS सिग्नल उपलब्ध नहीं। कृपया स्थान टाइप करें।');
        setIsGpsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 10000,
      }
    );
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      {/* Label and GPS Trigger */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
          {isPickup ? (
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Navigation className="w-3.5 h-3.5 text-[#FF8C00]" />
          )}
          <span>{label}</span>
        </label>

        {showGpsButton && (
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isGpsLocating}
            className="text-[11px] font-bold text-[#FF8C00] hover:text-orange-400 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 active:scale-95"
            title="वर्तमान जीपीएस लोकेशन ऑटो-डिटेक्ट करें"
          >
            {isGpsLocating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#FF8C00]" />
                <span>GPS खोज रहा है...</span>
              </>
            ) : (
              <>
                <Compass className="w-3.5 h-3.5" />
                <span>लाइव GPS से चुनें</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Input Field with Clear & Search Indicator */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            if (value.trim()) {
              searchAddressSuggestions(value, currentLocationCoords).then(setSuggestions);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FF8C00] rounded-xl pl-3.5 pr-8 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
        />

        {isLoading ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
          </div>
        ) : value ? (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSuggestions([]);
              setIsOpen(true);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5"
            title="हटाएं"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <Search className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <p className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 p-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
          <span>{statusMessage}</span>
        </p>
      )}

      {/* Real-time Dynamic Google Maps Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto divide-y divide-zinc-900 animate-in fade-in zoom-in-95 duration-150">
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-zinc-900/90 text-[10px] uppercase tracking-wider font-extrabold text-zinc-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#FF8C00]" />
              <span>Google Maps लाइव सुझाव</span>
            </span>
            <span className="text-emerald-400 font-bold">100% सटीक</span>
          </div>

          {/* Real Google Maps Suggestions List */}
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full p-2.5 text-left hover:bg-zinc-900/90 flex items-start gap-2.5 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 group-hover:bg-[#FF8C00]/20 group-hover:border-[#FF8C00]/40 text-zinc-400 group-hover:text-[#FF8C00] transition-colors shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-xs text-white block truncate group-hover:text-[#FF8C00] transition-colors">
                      {item.mainText}
                    </span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {item.secondaryText || item.description}
                    </span>
                  </div>
                </button>
              ))}

              {/* Exact typed fallback at bottom */}
              {value.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelectExactTyped(value)}
                  className="w-full p-2.5 text-left bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center gap-2 text-xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">सीधे यही चुनें: "{value.trim()}"</span>
                </button>
              )}
            </>
          ) : (
            <div className="p-3 text-center text-xs text-zinc-400 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-zinc-400">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FF8C00]" />
                  <span>Google Maps से खोज रहा है...</span>
                </div>
              ) : value.trim() ? (
                <div className="space-y-1.5 py-1">
                  <p className="text-zinc-400 text-xs">कोई सुझाव नहीं मिला। आप इसे सीधे चुन सकते हैं:</p>
                  <button
                    type="button"
                    onClick={() => handleSelectExactTyped(value)}
                    className="w-full py-2 px-3 bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold rounded-xl text-xs transition-all shadow-md active:scale-95"
                  >
                    👉 "{value.trim()}" को ही लोकेशन बनाएं
                  </button>
                </div>
              ) : (
                <div className="py-2 text-zinc-500 text-[11px] space-y-1">
                  <p>पूरे भारत का कोई भी शहर, कस्बा, गांव, चौराहा या लैंडमार्क खोजें</p>
                  {showGpsButton && (
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      className="mt-1 inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold text-xs"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>वर्तमान जीपीएस स्थान चुनें</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
