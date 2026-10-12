import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileText,
  Car,
  Check,
  Save,
  LogOut,
  Sparkles,
  Award,
  Sun,
  Moon,
} from 'lucide-react';
import { UserProfile, DriverKycDoc } from '../types';
import { DocumentUploadSection } from './DocumentUploadSection';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  initialTab?: 'documents' | 'profile' | 'vehicle';
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  initialTab = 'documents',
  onOpenAuth,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'profile' | 'vehicle'>(
    initialTab
  );

  const { theme, toggleTheme, setTheme } = useTheme();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [city, setCity] = useState(currentUser?.city || 'प्रयागराज, उत्तर प्रदेश');
  const [role, setRole] = useState(currentUser?.role || 'passenger');
  const [vehicleNo, setVehicleNo] = useState('UP32-AK-4421');
  const [vehicleModel, setVehicleModel] = useState('Bajaj Compact Auto');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setCity(currentUser.city || 'प्रयागराज, उत्तर प्रदेश');
      setRole(currentUser.role || 'passenger');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-[#FF8C00] flex items-center justify-center">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">खाता लॉगिन आवश्यक है</h3>
            <p className="text-xs text-zinc-400 mt-1">
              प्रोफ़ाइल सेटिंग्स, KYC दस्तावेज और वाहन विवरण देखने के लिए कृपया लॉगिन करें।
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs"
            >
              रद्द करें
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth?.();
              }}
              className="flex-1 py-2.5 rounded-xl bg-[#FF8C00] text-black font-black text-xs hover:bg-orange-600 transition-all shadow-md"
            >
              लॉगिन / नया खाता
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      name,
      phone,
      email,
      city,
      role: role as any,
    };

    // Save to Firestore
    try {
      if (currentUser.id) {
        await setDoc(
          doc(db, 'users', currentUser.id),
          {
            userId: currentUser.id,
            name,
            phone,
            email,
            city,
            role,
            isVerified: true,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err) {
      console.warn('Firestore update warning:', err);
    }

    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF8C00] to-amber-600 text-black flex items-center justify-center font-black text-lg shadow-lg shadow-amber-500/20 border border-amber-300">
                {name ? name[0] : 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-zinc-950 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {name}
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/40 uppercase">
                  {role === 'driver' ? 'चालक (Driver)' : role === 'admin' ? 'एडमिन' : 'उपयोगकर्ता'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                प्रोफ़ाइल सेटिंग्स व अधिकृत दस्तावेज़ सत्यापन
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1 p-2 bg-zinc-900 border-b border-zinc-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'documents'
                ? 'bg-[#FF8C00] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>दस्तावेज़ अपलोड (KYC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-[#FF8C00] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>प्रोफ़ाइल विवरण</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vehicle')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'vehicle'
                ? 'bg-[#FF8C00] text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>वाहन व अनुमतियां</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: Document Upload (Requested by user) */}
          {activeTab === 'documents' && (
            <DocumentUploadSection currentUser={currentUser} />
          )}

          {/* TAB 2: Personal Profile Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg mx-auto text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 block text-[11px]">खाता आईडी (User ID):</span>
                  <span className="font-mono font-bold text-amber-400">{currentUser.id}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                  सत्यापित खाता
                </span>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  पूरा नाम (Full Name):
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    मोबाइल नंबर (Phone):
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF8C00]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 font-semibold mb-1">
                    ईमेल आईडी (Email):
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF8C00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  शहर / कार्यक्षेत्र (Operating City):
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF8C00]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  भूमिका (Account Role):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'driver', label: '🚖 चालक (Driver)' },
                    { id: 'passenger', label: '👤 यात्री (Passenger)' },
                    { id: 'admin', label: '🛡️ एडमिन (Admin)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        role === r.id
                          ? 'bg-[#FF8C00] text-black border-amber-400'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Preference Toggle (Light / Dark) */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-[#FF8C00]">
                      {theme === 'dark' ? (
                        <Moon className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-white block">
                        थीम मोड (Appearance Theme)
                      </span>
                      <span className="text-[11px] text-zinc-400">
                        {theme === 'dark' ? 'डार्क मोड (Dark Mode सक्रिय)' : 'लाइट मोड (Light Mode सक्रिय)'}
                      </span>
                    </div>
                  </div>

                  {/* Switch Pill Toggle */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      theme === 'dark' ? 'bg-[#FF8C00]' : 'bg-zinc-700'
                    }`}
                    aria-label="Toggle theme"
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <Moon className="w-3.5 h-3.5 text-zinc-900" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </span>
                  </button>
                </div>

                {/* Segmented control buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md font-extrabold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>लाइट (Light Mode)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-[#FF8C00] text-black border-amber-400 shadow-md font-extrabold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>डार्क (Dark Mode)</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> बदलाव सहेज लिए गए!
                  </span>
                ) : (
                  <span />
                )}

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>सेव करें (Save Profile)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Vehicle & Badges */}
          {activeTab === 'vehicle' && (
            <div className="space-y-4 max-w-lg mx-auto text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="font-extrabold text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#FF8C00]" />
                  <span>पंजीकृत वाहन विवरण (Registered Vehicle)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      गाड़ी नंबर (Number Plate):
                    </label>
                    <input
                      type="text"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono focus:border-[#FF8C00]"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-[11px] mb-1">
                      वाहन मॉडल (Vehicle Model):
                    </label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:border-[#FF8C00]"
                    />
                  </div>
                </div>
              </div>

              {/* RTO Safety Badge Status */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Award className="w-5 h-5" />
                  <span>सुरक्षा और RTO अनुपालन स्थिति</span>
                </div>
                <p className="text-zinc-300 text-xs">
                  जैसे ही आपके <strong>पुलिस सत्यापन प्रमाण पत्र, आधार कार्ड व ड्राइविंग लाइसेंस</strong>{' '}
                  स्वीकृत हो जाएंगे, आपको सवारी सेतु पर <strong>गोल्डन ड्राइवर बैज</strong> और अधिक
                  बुकिंग प्राथमिकता मिलेगी।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 gap-2">
          {onLogout ? (
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-900/40 cursor-pointer font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट करें (Log Out)</span>
            </button>
          ) : (
            onOpenAuth && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>खाता बदलें</span>
              </button>
            )
          )}
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold ml-auto cursor-pointer"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
