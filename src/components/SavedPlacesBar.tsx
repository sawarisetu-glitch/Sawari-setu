import React, { useState } from 'react';
import { Home, Briefcase, Warehouse, Store, Plus, MapPin, Check } from 'lucide-react';
import { SavedPlace } from '../types';
import { INITIAL_SAVED_PLACES } from '../utils/storage';

interface SavedPlacesBarProps {
  onSelectPlace: (address: string, coords: { lat: number; lng: number }) => void;
  targetField: 'pickup' | 'destination';
}

export const SavedPlacesBar: React.FC<SavedPlacesBarProps> = ({
  onSelectPlace,
  targetField,
}) => {
  const [places, setPlaces] = useState<SavedPlace[]>(INITIAL_SAVED_PLACES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState('');
  const [newPlaceAddress, setNewPlaceAddress] = useState('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const getIcon = (type: SavedPlace['icon']) => {
    switch (type) {
      case 'home':
        return Home;
      case 'work':
        return Briefcase;
      case 'warehouse':
        return Warehouse;
      case 'mandi':
        return Store;
      default:
        return MapPin;
    }
  };

  const handleSelect = (place: SavedPlace) => {
    setSelectedPlaceId(place.id);
    onSelectPlace(place.address, { lat: place.lat, lng: place.lng });
    setTimeout(() => setSelectedPlaceId(null), 1200);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceName || !newPlaceAddress) return;
    const newPlace: SavedPlace = {
      id: `sp_${Date.now()}`,
      name: newPlaceName,
      address: newPlaceAddress,
      icon: 'other',
      lat: 26.85,
      lng: 80.94,
    };
    setPlaces([...places, newPlace]);
    setShowAddModal(false);
    setNewPlaceName('');
    setNewPlaceAddress('');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
        <span className="font-semibold text-zinc-300">
          पसंदीदा पते ({targetField === 'pickup' ? 'पिकअप' : 'गंतव्य'} हेतु):
        </span>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="text-[#FF8C00] hover:underline flex items-center gap-0.5 font-bold"
        >
          <Plus className="w-3 h-3" /> नया पता जोड़ें
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {places.map((place) => {
          const Icon = getIcon(place.icon);
          const isChosen = selectedPlaceId === place.id;

          return (
            <button
              key={place.id}
              type="button"
              onClick={() => handleSelect(place)}
              className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                isChosen
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500'
                  : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
              title={place.address}
            >
              {isChosen ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Icon className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>{place.name}</span>
            </button>
          );
        })}
      </div>

      {/* Add New Place Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FF8C00]" />
              <span>नया पसंदीदा पता जोड़ें</span>
            </h4>
            <form onSubmit={handleAddNew} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-zinc-300 mb-1">स्थान का नाम (जैसे: दुकान / गोदाम 2)</label>
                <input
                  type="text"
                  required
                  value={newPlaceName}
                  onChange={(e) => setNewPlaceName(e.target.value)}
                  placeholder="स्थान का नाम"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div>
                <label className="block text-zinc-300 mb-1">पूरा पता (Address)</label>
                <input
                  type="text"
                  required
                  value={newPlaceAddress}
                  onChange={(e) => setNewPlaceAddress(e.target.value)}
                  placeholder="मोहल्ला, लैंडमार्क, शहर"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#FF8C00] text-black font-extrabold hover:bg-orange-600"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
