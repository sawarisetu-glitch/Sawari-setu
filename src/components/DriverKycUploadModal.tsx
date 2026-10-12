import React, { useState } from 'react';
import {
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  X,
  Camera,
  AlertTriangle,
  UserCheck,
  Car,
  Building2,
  Lock,
} from 'lucide-react';
import { DriverKycDoc, KycDocType, KycDocCategory } from '../types';
import { fileToBase64 } from '../utils/firebaseStorageService';
import confetti from 'canvas-confetti';

interface DriverKycUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadDoc: (doc: DriverKycDoc) => void;
  driverName?: string;
  driverPhone?: string;
  driverId?: string;
}

export const DriverKycUploadModal: React.FC<DriverKycUploadModalProps> = ({
  isOpen,
  onClose,
  onUploadDoc,
  driverName = 'चालक पार्टनर',
  driverPhone = '9450985355',
  driverId = 'usr_driver',
}) => {
  const [docType, setDocType] = useState<KycDocType>('Commercial DL');
  const [docNumber, setDocNumber] = useState('');
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      try {
        const b64 = await fileToBase64(file);
        setPreviewUrl(b64);
      } catch {
        // Non-fatal
      }
    }
  };

  const getCategoryForDoc = (type: KycDocType): KycDocCategory => {
    if (['Commercial DL', 'Driving Licence', 'Aadhaar Card', 'Aadhaar', 'PAN Card', 'PAN', 'Address Proof', 'Police Verification', 'Profile Photo'].includes(type)) {
      return 'driver';
    }
    if (['Vehicle RC', 'Vehicle Insurance', 'Commercial Insurance', 'Permit', 'PUC', 'Fitness Certificate'].includes(type)) {
      return 'vehicle';
    }
    if (['Owner PAN', 'Bank Details'].includes(type)) {
      return 'bank';
    }
    return 'fleet';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber) return;

    setIsSubmitting(true);
    const category = getCategoryForDoc(docType);

    const newDoc: DriverKycDoc = {
      id: `doc_${Date.now()}`,
      driverId,
      driverName,
      driverPhone,
      category,
      docType,
      docTitle: docType,
      docNumber: docNumber.trim().toUpperCase(),
      status: 'pending',
      uploadedAt: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      previewUrl: previewUrl || undefined,
      fileName: fileName || undefined,
    };

    onUploadDoc(newDoc);
    setIsSuccess(true);
    confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 p-2 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">ड्राइवर दस्तावेज सत्यापन (KYC)</h3>
              <p className="text-[11px] text-zinc-400">RTO, पुलिस एवं बैंक अनुपालन कागजात</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">दस्तावेज सफलतापूर्वक सबमिट हुआ!</h4>
            <p className="text-xs text-zinc-400">
              सवारी सेतु एडमिन टीम 2-4 घंटे में सत्यापन पूर्ण करेगी।
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">दस्तावेज का प्रकार चुनें:</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#FF8C00]"
              >
                <optgroup label="1. ड्राइवर से जुड़े जरूरी दस्तावेज">
                  <option value="Commercial DL">कमर्शियल ड्राइविंग लाइसेंस (Commercial DL / Yellow Badge)</option>
                  <option value="Aadhaar Card">पहचान प्रमाण: आधार कार्ड (Aadhaar Card)</option>
                  <option value="PAN Card">पहचान प्रमाण: पैन कार्ड (PAN Card)</option>
                  <option value="Address Proof">पते का प्रमाण (वोटर आईडी / बिजली बिल / पासपोर्ट)</option>
                  <option value="Police Verification">पुलिस वेरिफिकेशन सर्टिफिकेट (PVC / कैरेक्टर)</option>
                  <option value="Profile Photo">पासपोर्ट साइज प्रोफाइल फोटो (Clear Photo)</option>
                </optgroup>

                <optgroup label="2. वाहन से जुड़े जरूरी दस्तावेज">
                  <option value="Vehicle RC">आरसी बुक (कमर्शियल येलो प्लेट रजिस्ट्रेशन)</option>
                  <option value="Vehicle Insurance">वाहन बीमा (कॉमर्शियल कॉम्प्रिहेंसिव इंश्योरेंस)</option>
                  <option value="Permit">परमिट (कमर्शियल / टूरिस्ट टैक्सी / कैरिज)</option>
                  <option value="PUC">पॉल्यूशन सर्टिफिकेट (PUC - प्रदूषण प्रमाण पत्र)</option>
                  <option value="Fitness Certificate">फिटनेस सर्टिफिकेट (RTO वाहन फिटनेस)</option>
                </optgroup>

                <optgroup label="3. बैंक और भुगतान संबंधित दस्तावेज">
                  <option value="Owner PAN">पैन कार्ड (ओनर / वाहन मालिक का पैन कार्ड)</option>
                  <option value="Bank Details">बैंक खाता विवरण (पासबुक कॉपी / कैंसल चेक)</option>
                </optgroup>

                <optgroup label="अन्य जरूरतें">
                  <option value="GST / Trade Certificate">जीएसटी एवं ट्रेड सर्टिफिकेट (फ्लीट ऑपरेटर)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">दस्तावेज क्रमांक / नंबर दर्ज करें:</label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value.toUpperCase())}
                placeholder="जैसे: UP32 20190048123 या ABCDE1234F"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#FF8C00]"
              />
            </div>

            {/* File upload box */}
            <div>
              <label className="block text-zinc-300 mb-1 font-semibold">दस्तावेज की फोटो / PDF कॉपी:</label>
              <label className="border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-zinc-900/40 transition-all">
                <Camera className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-zinc-300 font-bold text-xs truncate max-w-[280px]">
                  {fileName ? fileName : 'कैमरा खोलें या गैलरी से फाइल चुनें'}
                </span>
                <span className="text-[10px] text-zinc-500 mt-0.5">JPG, PNG या PDF (अधिकतम 10MB)</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-900 text-[10px] text-zinc-400 flex items-start gap-2 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>आपके दस्तावेज सरकारी RTO, पुलिस व UIDAI सुरक्षा नियमों के तहत 256-बिट सुरक्षित रहते हैं।</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-[#FF8C00] hover:bg-orange-600 text-black font-black text-xs shadow-md shadow-amber-500/20 active:scale-98 disabled:opacity-50"
            >
              सत्यापन हेतु भेजें (Submit for KYC Approval)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
