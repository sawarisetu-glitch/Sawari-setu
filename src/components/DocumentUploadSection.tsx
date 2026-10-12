import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  X,
  ShieldCheck,
  Lock,
  Sparkles,
  RefreshCw,
  FileCheck,
  Camera,
  Image as ImageIcon,
  ExternalLink,
  Car,
  UserCheck,
  Building2,
  Smartphone,
  HelpCircle,
  Download,
  Info,
} from 'lucide-react';
import { DriverKycDoc, KycDocType, KycDocCategory, UserProfile } from '../types';
import {
  uploadDriverDocumentToFirebase,
  fetchDriverDocuments,
  deleteDriverDocumentFromFirebase,
  getLocalDriverDocuments,
} from '../utils/firebaseStorageService';
import confetti from 'canvas-confetti';

interface DocumentUploadSectionProps {
  currentUser: UserProfile;
  onDocumentsUpdated?: (docs: DriverKycDoc[]) => void;
}

export interface DocCategoryConfig {
  type: KycDocType;
  category: KycDocCategory;
  categoryTitle: string;
  title: string;
  subtext: string;
  requirementDetail: string;
  placeholderNumber: string;
  numberLabel: string;
  badge: string;
  required: boolean;
  iconColor: string;
  acceptedFormats: string;
  aliases?: string[];
}

export const MASTER_KYC_CATEGORIES: DocCategoryConfig[] = [
  // ==========================================
  // 1. ड्राइवर से जुड़े जरूरी दस्तावेज (Driver Documents)
  // ==========================================
  {
    type: 'Commercial DL',
    aliases: ['Driving Licence'],
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'कमर्शियल ड्राइविंग लाइसेंस (Commercial DL / Yellow Badge)',
    subtext: 'आपके पास वैध कमर्शियल ड्राइविंग लाइसेंस होना जरूरी है।',
    requirementDetail:
      'परिवहन विभाग (RTO) द्वारा जारी वैध कमर्शियल लाइसेंस या येलो बैज (LMV-TR / Transport / Commercial Badge)। बिना कमर्शियल लाइसेंस सवारी या माल कमर्शियल बुकिंग की अनुमति नहीं है।',
    numberLabel: 'कमर्शियल लाइसेंस नंबर (DL No.):',
    placeholderNumber: 'UP32 20190048123',
    badge: 'अनिवार्य लाइसेंस',
    required: true,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Aadhaar Card',
    aliases: ['Aadhaar'],
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'पहचान प्रमाण: आधार कार्ड (Aadhaar Card - Front / Back)',
    subtext: 'पहचान प्रमाण (Identity Proof): आधार कार्ड (Aadhaar Card)।',
    requirementDetail:
      'यूआईडीएआई (UIDAI) द्वारा जारी 12-अंकों का आधिकारिक आधार कार्ड (आगे व पीछे दोनों तरफ की स्पष्ट फोटो)। चालक का स्थायी पता व जन्मतिथि स्पष्ट दिखनी चाहिए।',
    numberLabel: '12-अंकों का आधार नंबर (UIDAI No.):',
    placeholderNumber: '9450 9853 5512',
    badge: 'पहचान प्रमाण',
    required: true,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'PAN Card',
    aliases: ['PAN'],
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'पहचान प्रमाण: पैन कार्ड (Driver PAN Card)',
    subtext: 'पहचान प्रमाण (Identity Proof): पैन कार्ड (PAN Card)।',
    requirementDetail:
      'आयकर विभाग (Income Tax Dept) द्वारा जारी 10-अक्षरों का अल्फान्यूमेरिक पैन कार्ड। पहचान व वित्तीय सत्यापन हेतु अनिवार्य।',
    numberLabel: 'ड्राइवर पैन कार्ड नंबर (PAN Number):',
    placeholderNumber: 'ABCDE1234F',
    badge: 'पहचान प्रमाण',
    required: true,
    iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Address Proof',
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'पते का प्रमाण (Address Proof)',
    subtext: 'वर्तमान और स्थायी पते का प्रमाण (जैसे- वोटर आईडी, बिजली का बिल या पासपोर्ट)।',
    requirementDetail:
      'चालक के वर्तमान अथवा स्थायी निवास का आधिकारिक प्रमाण पत्र (वोटर आईडी कार्ड, हालिया 3 माह का बिजली बिल, पासपोर्ट या राशन कार्ड)।',
    numberLabel: 'पता प्रमाण दस्तावेज नंबर (Ref / Doc No.):',
    placeholderNumber: 'VOTE-UP-981240',
    badge: 'पते का प्रमाण',
    required: true,
    iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Police Verification',
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'पुलिस वेरिफिकेशन सर्टिफिकेट (Police Verification Certificate - PVC)',
    subtext: 'सुरक्षा कारणों से ड्राइवर का पुलिस द्वारा सत्यापित कैरेक्टर सर्टिफिकेट अनिवार्य होता है।',
    requirementDetail:
      'स्थानीय पुलिस कमिश्नरेट / थाने या UP COP पोर्टल द्वारा जारी चरित्र सत्यापन प्रमाण पत्र (PVC)। यात्रियों व पार्सल की पूर्ण सुरक्षा हेतु 100% अनिवार्य।',
    numberLabel: 'पुलिस वेरिफिकेशन संदर्भ संख्या (PVC / CCTNS No.):',
    placeholderNumber: 'PVC-UP-2026-98124',
    badge: 'अनिवार्य सुरक्षा',
    required: true,
    iconColor: 'text-red-400 bg-red-500/10 border-red-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Profile Photo',
    category: 'driver',
    categoryTitle: '1. ड्राइवर से जुड़े जरूरी दस्तावेज',
    title: 'पासपोर्ट साइज फोटो (Driver Clear Profile Photo)',
    subtext: 'पासपोर्ट साइज फोटो: ड्राइवर की स्पष्ट प्रोफाइल फोटो।',
    requirementDetail:
      'सफेद या हल्के बैकग्राउंड के साथ हालिया रंगीन पासपोर्ट साइज फोटो जिसमें चेहरा, आंखें और दोनों कान स्पष्ट हों (बिना धूप के चश्मे या टोपी के)।',
    numberLabel: 'फोटो संदर्भ पहचान (Photo Ref):',
    placeholderNumber: 'PHOTO-2026-DRV',
    badge: 'प्रोफाइल फोटो',
    required: true,
    iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    acceptedFormats: 'JPG, PNG',
  },

  // ==========================================
  // 2. वाहन से जुड़े जरूरी दस्तावेज (Vehicle/Car Documents)
  // ==========================================
  {
    type: 'Vehicle RC',
    category: 'vehicle',
    categoryTitle: '2. वाहन से जुड़े जरूरी दस्तावेज',
    title: 'आरसी बुक (Registration Certificate - RC: कमर्शियल येलो प्लेट)',
    subtext: 'आरसी बुक: कमर्शियल (कमर्शियल येलो प्लेट वाली गाड़ी) रजिस्ट्रेशन सर्टिफिकेट।',
    requirementDetail:
      'परिवहन विभाग (RTO) द्वारा जारी कमर्शियल (पीली नंबर प्लेट) वाहन पंजीकरण प्रमाण पत्र। चेसिस व इंजन नंबर स्पष्ट होना अनिवार्य है।',
    numberLabel: 'वाहन पंजीयन क्रमांक (Vehicle RC No.):',
    placeholderNumber: 'UP32-AK-4421',
    badge: 'कमर्शियल येलो प्लेट',
    required: true,
    iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Vehicle Insurance',
    aliases: ['Commercial Insurance'],
    category: 'vehicle',
    categoryTitle: '2. वाहन से जुड़े जरूरी दस्तावेज',
    title: 'वाहन बीमा (Commercial Comprehensive Vehicle Insurance)',
    subtext: 'वाहन बीमा: गाड़ी का वैध कॉमर्शियल कॉम्प्रिहेंसिव इंश्योरेंस।',
    requirementDetail:
      'गाड़ी का वैध कमर्शियल बीमा (थर्ड पार्टी व कॉम्प्रिहेंसिव पॉलिसी)। एक्सपायरी तारीख कम से कम 30 दिन आगे होनी चाहिए।',
    numberLabel: 'बीमा पॉलिसी संख्या (Insurance Policy No.):',
    placeholderNumber: 'POL-ICICI-2026-9921',
    badge: 'कॉमर्शियल बीमा',
    required: true,
    iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Permit',
    category: 'vehicle',
    categoryTitle: '2. वाहन से जुड़े जरूरी दस्तावेज',
    title: 'परमिट (Commercial / Taxi / Contract Carriage Permit)',
    subtext: 'परमिट: कमर्शियल या टूरिस्ट टैक्सी परमिट / कॉन्ट्रैक्ट कैरिज परमिट।',
    requirementDetail:
      'राज्य परिवहन प्राधिकरण द्वारा जारी वैध टैक्सी परमिट / ऑल यूपी परमिट / कॉन्ट्रैक्ट कैरिज परमिट।',
    numberLabel: 'परमिट नंबर (Permit Number):',
    placeholderNumber: 'PERMIT-UP-TAXI-8841',
    badge: 'टैक्सी परमिट',
    required: true,
    iconColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'PUC',
    category: 'vehicle',
    categoryTitle: '2. वाहन से जुड़े जरूरी दस्तावेज',
    title: 'पॉल्यूशन सर्टिफिकेट (PUC - Pollution Under Control)',
    subtext: 'पॉल्यूशन सर्टिफिकेट: प्रदूषण नियंत्रण प्रमाण पत्र।',
    requirementDetail:
      'अधिकृत प्रदूषण जांच केंद्र द्वारा जारी वैध ग्रीन/ऑनलाइन PUC सर्टिफिकेट। पर्यावरण व RTO नियमों के तहत अनिवार्य।',
    numberLabel: 'प्रदूषण प्रमाण पत्र संख्या (PUC No.):',
    placeholderNumber: 'PUC-UP-2026-11029',
    badge: 'प्रदूषण प्रमाण पत्र',
    required: true,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Fitness Certificate',
    category: 'vehicle',
    categoryTitle: '2. वाहन से जुड़े जरूरी दस्तावेज',
    title: 'फिटनेस सर्टिफिकेट (Vehicle Fitness Certificate - RTO)',
    subtext: 'फिटनेस सर्टिफिकेट: ट्रांसपोर्ट अथॉरिटी (RTO) द्वारा जारी वाहन का फिटनेस प्रमाण पत्र।',
    requirementDetail:
      'संबंधित RTO द्वारा जारी वाहन फिटनेस प्रमाण पत्र जो यह सत्यापित करता है कि गाड़ी तकनीकी व सुरक्षा मानकों पर खरी है।',
    numberLabel: 'फिटनेस प्रमाण पत्र संख्या (Fitness Cert No.):',
    placeholderNumber: 'FIT-RTO-UP-2026-5541',
    badge: 'RTO फिटनेस',
    required: true,
    iconColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },

  // ==========================================
  // 3. बैंक और भुगतान संबंधित दस्तावेज (Payment & Bank Details)
  // ==========================================
  {
    type: 'Owner PAN',
    category: 'bank',
    categoryTitle: '3. बैंक और भुगतान संबंधित दस्तावेज',
    title: 'ओनर का पैन कार्ड (Owner PAN Card)',
    subtext: 'पैन कार्ड (PAN Card): ओनर / वाहन मालिक का पैन कार्ड।',
    requirementDetail:
      'यदि वाहन चालक और वाहन मालिक अलग-अलग हैं या फ्लीट ऑपरेटर हैं, तो वाहन मालिक (Vehicle Owner) का पैन कार्ड टीडीएस व भुगतान सुरक्षा हेतु अनिवार्य है।',
    numberLabel: 'वाहन ओनर पैन कार्ड नंबर (Owner PAN):',
    placeholderNumber: 'ABCDE5678G',
    badge: 'ओनर पैन कार्ड',
    required: true,
    iconColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
  {
    type: 'Bank Details',
    category: 'bank',
    categoryTitle: '3. बैंक और भुगतान संबंधित दस्तावेज',
    title: 'बैंक खाता विवरण (Bank Passbook / Cancelled Cheque)',
    subtext: 'बैंक खाता विवरण: अर्निंग्स के ट्रांसफर के लिए बैंक पासबुक की कॉपी या कैंसल चेक।',
    requirementDetail:
      'दैनिक कमाई/अर्निंग्स के 100% ट्रांसफर हेतु बैंक पासबुक के मुख्य पृष्ठ की फोटो या हस्ताक्षरित कैंसल चेक (Cancelled Cheque)। खाता संख्या व IFSC कोड साफ पठनीय होना चाहिए।',
    numberLabel: 'खाता संख्या एवं IFSC कोड:',
    placeholderNumber: 'SBIN0001234 - 39201928341',
    badge: 'पासबुक / कैंसल चेक',
    required: true,
    iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },

  // ==========================================
  // अन्य जरूरतें (Other Requirements - Fleet & Logistics)
  // ==========================================
  {
    type: 'GST / Trade Certificate',
    category: 'fleet',
    categoryTitle: 'अन्य जरूरतें (फ्लीट / लॉजिस्टिक्स)',
    title: 'जीएसटी एवं ट्रेड सर्टिफिकेट (GST / Trade Certificate for Fleet)',
    subtext: 'यदि आप अपनी ट्रांसपोर्ट या लॉजिस्टिक्स कंपनी/फ्लीट जोड़ रहे हैं, तो जीएसटी और ट्रेड सर्टिफिकेट।',
    requirementDetail:
      'ट्रांसपोर्ट कंपनियों, फ्लीट स्वामियों एवं लॉजिस्टिक्स एजेंसियों के लिए वैध GSTIN प्रमाण पत्र एवं ट्रेड लाइसेंस। सिंगल ओनर ड्राइवरों के लिए वैकल्पिक।',
    numberLabel: 'जीएसटी पहचान संख्या (GSTIN / Trade Reg):',
    placeholderNumber: '09AAAAA0000A1Z5',
    badge: 'लॉजिस्टिक्स फ्लीट',
    required: false,
    iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    acceptedFormats: 'JPG, PNG, PDF',
  },
];

export const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({
  currentUser,
  onDocumentsUpdated,
}) => {
  const [documents, setDocuments] = useState<DriverKycDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'driver' | 'vehicle' | 'bank' | 'fleet' | 'smartphone'>('all');
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [docNumbers, setDocNumbers] = useState<{ [key: string]: string }>({});
  const [selectedPreview, setSelectedPreview] = useState<DriverKycDoc | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const driverId = currentUser?.id || 'usr_driver';
  const driverName = currentUser?.name || 'चालक पार्टनर';
  const driverPhone = currentUser?.phone || '9450985355';

  // Load documents on mount
  useEffect(() => {
    loadDocs();
  }, [driverId]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await fetchDriverDocuments(driverId);
      setDocuments(docs);
      if (onDocumentsUpdated) onDocumentsUpdated(docs);

      // Prepopulate doc numbers
      const numMap: { [key: string]: string } = {};
      docs.forEach((d) => {
        if (d.docNumber) numMap[d.docType] = d.docNumber;
      });
      setDocNumbers((prev) => ({ ...prev, ...numMap }));
    } catch {
      const localDocs = getLocalDriverDocuments(driverId);
      setDocuments(localDocs);
      const numMap: { [key: string]: string } = {};
      localDocs.forEach((d) => {
        if (d.docNumber) numMap[d.docType] = d.docNumber;
      });
      setDocNumbers((prev) => ({ ...prev, ...numMap }));
    } finally {
      setLoading(false);
    }
  };

  const findUploadedDoc = (cat: DocCategoryConfig): DriverKycDoc | undefined => {
    return documents.find(
      (d) => d.docType === cat.type || (cat.aliases && cat.aliases.includes(d.docType))
    );
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cat: DocCategoryConfig
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setStatusMessage({
        type: 'error',
        text: 'फ़ाइल का साइज़ 10MB से अधिक नहीं होना चाहिए।',
      });
      return;
    }

    const docNum = docNumbers[cat.type] || cat.placeholderNumber;

    setUploadingType(cat.type);
    setUploadProgress(10);
    setStatusMessage(null);

    try {
      const result = await uploadDriverDocumentToFirebase(
        file,
        cat.type,
        driverId,
        docNum,
        driverName,
        driverPhone,
        (pct) => setUploadProgress(pct),
        cat.category,
        cat.title
      );

      if (result.success) {
        setDocuments((prev) => [
          result.doc,
          ...prev.filter(
            (d) => d.docType !== cat.type && (!cat.aliases || !cat.aliases.includes(d.docType))
          ),
        ]);
        if (onDocumentsUpdated) {
          onDocumentsUpdated([
            result.doc,
            ...documents.filter(
              (d) => d.docType !== cat.type && (!cat.aliases || !cat.aliases.includes(d.docType))
            ),
          ]);
        }
        setStatusMessage({
          type: 'success',
          text: `✓ ${cat.title} सफलतापूर्वक Firebase Storage में सुरक्षित अपलोड हो गया!`,
        });
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `अपलोड में त्रुटि: ${err.message || 'कृपया पुनः प्रयास करें।'}`,
      });
    } finally {
      setUploadingType(null);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleDelete = async (docItem: DriverKycDoc) => {
    if (!window.confirm(`क्या आप ${docItem.docTitle || docItem.docType} दस्तावेज़ हटाना चाहते हैं?`)) return;

    try {
      await deleteDriverDocumentFromFirebase(docItem.id, docItem.storageUrl);
      const updated = documents.filter((d) => d.id !== docItem.id);
      setDocuments(updated);
      if (onDocumentsUpdated) onDocumentsUpdated(updated);
      setStatusMessage({
        type: 'success',
        text: `दस्तावेज़ सफलतापूर्वक हटा दिया गया।`,
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `हटाने में समस्या आई: ${err.message || 'कृपया पुनः प्रयास करें'}`,
      });
    }
  };

  // Stats calculation
  const totalMandatoryDocs = MASTER_KYC_CATEGORIES.filter((c) => c.required).length;
  const uploadedMandatoryCount = MASTER_KYC_CATEGORIES.filter(
    (c) => c.required && findUploadedDoc(c)
  ).length;
  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const pendingCount = documents.filter((d) => d.status === 'pending').length;
  const progressPercent = Math.round((uploadedMandatoryCount / totalMandatoryDocs) * 100);

  // Filtered categories based on selected tab
  const filteredCategories =
    activeTab === 'all'
      ? MASTER_KYC_CATEGORIES
      : MASTER_KYC_CATEGORIES.filter((c) => c.category === activeTab);

  return (
    <div className="space-y-4">
      {/* Top Banner: RTO & KYC Master Checklist */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-900 border border-amber-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#FF8C00] text-black font-black shrink-0 shadow-md shadow-amber-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  ड्राइवर ऑनबोर्डिंग व आवश्यक दस्तावेज सत्यापन
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  ओला / उबर / सवारी सेतु पार्टनर मानक
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                चालक: <strong className="text-white">{driverName}</strong> • आईडी:{' '}
                <span className="text-amber-400 font-mono">{driverId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Info className="w-3.5 h-3.5" />
              <span>नियम व गाइड देखें</span>
            </button>
          </div>
        </div>

        {/* Progress Bar & Readiness Status */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
              <span>अनिवार्य दस्तावेज प्रगति:</span>
              <strong className="text-amber-400 font-mono">
                {uploadedMandatoryCount} / {totalMandatoryDocs} अपलोड
              </strong>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                progressPercent === 100
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {progressPercent === 100 ? '✅ सत्यापन व राइड्स हेतु तैयार' : `⏳ ${progressPercent}% पूर्ण`}
            </span>
          </div>

          <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                progressPercent === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Security & Cloud Storage Guarantee */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-zinc-400 pt-1">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> RTO व UIDAI सुरक्षा अनुपालन
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Firebase Cloud Storage
          </span>
          <span className="text-zinc-500">•</span>
          <span className="text-zinc-300">
            दस्तावेज केवल अधिकृत सत्यापन टीम द्वारा ही जांचे जाते हैं।
          </span>
        </div>
      </div>

      {/* Category Tabs (Exactly matching User's 3 sections + Device Requirements) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>सभी दस्तावेज ({MASTER_KYC_CATEGORIES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('driver')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'driver'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>1. ड्राइवर दस्तावेज (6)</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicle')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'vehicle'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>2. वाहन दस्तावेज (5)</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'bank'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>3. बैंक व भुगतान (2)</span>
        </button>

        <button
          onClick={() => setActiveTab('smartphone')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'smartphone'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>📱 स्मार्टफोन व अन्य</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'fleet'
              ? 'bg-[#FF8C00] text-black shadow-md shadow-amber-500/20 font-black'
              : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>फ्लीट / जीएसटी</span>
        </button>
      </div>

      {/* Status Notification Message */}
      {statusMessage && (
        <div
          className={`p-3 rounded-2xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="p-1 text-zinc-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Uploading Progress Bar Modal / Strip */}
      {uploadingType && (
        <div className="p-4 rounded-2xl bg-zinc-900 border-2 border-amber-500/80 shadow-2xl space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Firebase Cloud Storage में सुरक्षित अपलोड जारी है: {uploadingType}</span>
            </span>
            <span className="text-amber-400 font-mono">{uploadProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-zinc-400 text-center">
            कृपया विंडो बंद न करें, एन्क्रिप्टेड फ़ाइल अपलोड की जा रही है...
          </p>
        </div>
      )}

      {/* TAB: Smartphone & App Hardware Requirements View */}
      {activeTab === 'smartphone' && (
        <div className="p-5 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
            <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                अन्य जरूरतें: स्मार्टफोन व सिस्टम आवश्यकताएं
              </h3>
              <p className="text-xs text-zinc-400">
                ओला / उबर / सवारी सेतु पार्टनर ऐप संचालन हेतु डिवाइस चेकलिस्ट
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>एंड्रॉइड / आईओएस स्मार्टफोन (OS Support)</span>
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                ड्राइवर के पास एंड्रॉइड (वर्जन 8.0 या उच्च) अथवा आईओएस (iOS 14+) वाला 4G/5G स्मार्टफोन होना चाहिए, जिसपर पार्टनर ऐप ठीक से काम कर सके।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>सक्रिय GPS लोकेशन व इंटरनेट डेटा</span>
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                सटीक सवारी पिकअप, लाइव रूट नैविगेशन और SOS सुरक्षा ट्रैकिंग हेतु डिवाइस में निरंतर हाई-एक्यूरेसी GPS ऑन होना चाहिए।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>मोबाइल कार चार्जर व मोबाइल होल्डर</span>
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                ड्राइविंग के दौरान सुरक्षित व बिना हाथ लगाए नेविगेशन देखने के लिए डैशबोर्ड मोबाइल होल्डर तथा दिनभर बैटरी बैकअप हेतु फास्ट कार चार्जर।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1.5">
              <span className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>पार्टनर हेल्पलाइन व 24x7 इमरजेंसी सपोर्ट</span>
              </span>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                ऐप में इंटीग्रेटेड SOS बटन, ऑडियो रिकॉर्डिंग और व्हाट्सएप पार्टनर सपोर्ट (+91 9450985355) हमेशा उपलब्ध रहता है।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Cards List */}
      {activeTab !== 'smartphone' && (
        <div className="space-y-3">
          {filteredCategories.map((cat, idx) => {
            const uploadedDoc = findUploadedDoc(cat);
            const isCurrentlyUploading = uploadingType === cat.type;

            return (
              <div
                key={cat.type}
                className={`p-4 rounded-2xl bg-zinc-950 border transition-all ${
                  uploadedDoc
                    ? 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/90 shadow-sm'
                    : 'border-zinc-800/80 bg-zinc-900/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left Info */}
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2.5 rounded-2xl border shrink-0 mt-0.5 ${cat.iconColor}`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">
                          {cat.categoryTitle}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-white">
                          {cat.title}
                        </h4>
                        <span className="text-[10px] bg-zinc-800 text-amber-400 px-2 py-0.5 rounded-md font-bold border border-zinc-700">
                          {cat.badge}
                        </span>
                        {cat.required && (
                          <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold border border-red-500/30">
                            अनिवार्य
                          </span>
                        )}
                      </div>

                      {/* User's Exact Requirement Note */}
                      <p className="text-xs text-zinc-300 font-medium">
                        {cat.subtext}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-900/60 p-2 rounded-xl border border-zinc-850">
                        {cat.requirementDetail}
                      </p>

                      {/* Document Number Input / Display */}
                      <div className="pt-1.5 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-zinc-400 font-semibold">
                          {cat.numberLabel}
                        </span>
                        <input
                          type="text"
                          value={docNumbers[cat.type] || ''}
                          onChange={(e) =>
                            setDocNumbers((prev) => ({
                              ...prev,
                              [cat.type]: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder={cat.placeholderNumber}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#FF8C00] font-mono uppercase min-w-[200px]"
                        />
                      </div>

                      {/* Metadata if already uploaded */}
                      {uploadedDoc && (
                        <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                          <span className="flex items-center gap-1 font-mono text-zinc-300">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            अपलोड: {uploadedDoc.uploadedAt.split('T')[0]}
                          </span>
                          {uploadedDoc.fileSize && (
                            <span className="text-zinc-500 font-mono">
                              साइज़: {uploadedDoc.fileSize}
                            </span>
                          )}
                          {uploadedDoc.fileName && (
                            <span className="text-zinc-400 truncate max-w-[180px]">
                              {uploadedDoc.fileName}
                            </span>
                          )}
                          {uploadedDoc.verifiedAt && (
                            <span className="text-emerald-400">
                              सत्यापित: {uploadedDoc.verifiedAt}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Status & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-zinc-800 shrink-0">
                    {/* Status Badge */}
                    {uploadedDoc ? (
                      <div className="flex items-center gap-1.5">
                        {uploadedDoc.status === 'approved' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> सत्यापित (Approved)
                          </span>
                        ) : uploadedDoc.status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[11px] font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> अस्वीकृत (Rejected)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> RTO जांच जारी (Pending)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 text-[11px] font-semibold">
                        अपलोड नहीं हुआ
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* Hidden Native File Input */}
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[cat.type] = el;
                        }}
                        onChange={(e) => handleFileSelect(e, cat)}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />

                      {/* Upload / Re-upload Button */}
                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[cat.type]?.click()}
                        disabled={isCurrentlyUploading}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
                          uploadedDoc
                            ? 'bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700'
                            : 'bg-[#FF8C00] hover:bg-orange-600 text-black shadow-amber-500/20 font-black'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{uploadedDoc ? 'नया अपलोड' : 'फोटो / PDF चुनें'}</span>
                      </button>

                      {/* Preview Button */}
                      {uploadedDoc && (
                        <button
                          type="button"
                          onClick={() => setSelectedPreview(uploadedDoc)}
                          className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700"
                          title="दस्तावेज़ देखें"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Button */}
                      {uploadedDoc && (
                        <button
                          type="button"
                          onClick={() => handleDelete(uploadedDoc)}
                          className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-white">
                  {selectedPreview.docTitle || selectedPreview.docType}
                </h4>
                <p className="text-xs text-zinc-400 font-mono">
                  क्रमांक: {selectedPreview.docNumber}
                </p>
              </div>
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-zinc-900/40">
              {selectedPreview.previewUrl || selectedPreview.storageUrl ? (
                selectedPreview.previewUrl?.startsWith('data:application/pdf') ||
                selectedPreview.fileName?.endsWith('.pdf') ? (
                  <div className="p-8 text-center space-y-2">
                    <FileText className="w-16 h-16 text-amber-400 mx-auto" />
                    <p className="text-xs text-white font-bold">{selectedPreview.fileName}</p>
                    <p className="text-[11px] text-zinc-400">PDF दस्तावेज़ सुरक्षित रूप से संग्रहीत है।</p>
                  </div>
                ) : (
                  <img
                    src={selectedPreview.previewUrl || selectedPreview.storageUrl}
                    alt={selectedPreview.docType}
                    className="max-h-[60vh] max-w-full rounded-2xl object-contain border border-zinc-800"
                  />
                )
              ) : (
                <div className="text-zinc-500 text-xs">पूर्वावलोकन उपलब्ध नहीं है</div>
              )}
            </div>

            <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                स्थिति:{' '}
                <strong
                  className={
                    selectedPreview.status === 'approved'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }
                >
                  {selectedPreview.status === 'approved'
                    ? 'सत्यापित'
                    : selectedPreview.status === 'rejected'
                    ? 'अस्वीकृत'
                    : 'सत्यापन प्रक्रियाधीन'}
                </strong>
              </span>
              <button
                onClick={() => setSelectedPreview(null)}
                className="px-4 py-1.5 rounded-xl bg-[#FF8C00] text-black font-bold text-xs"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Onboarding Guide Modal (Full Checklist as requested) */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-amber-950/40 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF8C00]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    ड्राइवर ऑनबोर्डिंग गाइड व जरूरी दस्तावेज सूची
                  </h3>
                  <p className="text-xs text-zinc-400">
                    ओला / उबर / सवारी सेतु पार्टनर पात्रता नियम
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed">
              {/* Category 1 */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  <span>1. ड्राइवर से जुड़े जरूरी दस्तावेज (Driver Documents)</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  <li>
                    <strong className="text-white">• कमर्शियल ड्राइविंग लाइसेंस (Commercial DL / Yellow Badge):</strong> आपके पास वैध कमर्शियल ड्राइविंग लाइसेंस होना जरूरी है।
                  </li>
                  <li>
                    <strong className="text-white">• पहचान प्रमाण (Identity Proof):</strong> पैन कार्ड (PAN Card) और आधार कार्ड (Aadhaar Card)।
                  </li>
                  <li>
                    <strong className="text-white">• पते का प्रमाण (Address Proof):</strong> वर्तमान और स्थायी पते का प्रमाण (जैसे- वोटर आईडी, बिजली का बिल या पासपोर्ट)।
                  </li>
                  <li>
                    <strong className="text-white">• पुलिस वेरिफिकेशन सर्टिफिकेट (PVC):</strong> सुरक्षा कारणों से ड्राइवर का पुलिस द्वारा सत्यापित कैरेक्टर सर्टिफिकेट अनिवार्य होता है।
                  </li>
                  <li>
                    <strong className="text-white">• पासपोर्ट साइज फोटो:</strong> ड्राइवर की स्पष्ट प्रोफाइल फोटो।
                  </li>
                </ul>
              </div>

              {/* Category 2 */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <h4 className="text-sm font-extrabold text-cyan-400 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  <span>2. वाहन से जुड़े जरूरी दस्तावेज (Vehicle/Car Documents)</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  <li>
                    <strong className="text-white">• आरसी बुक (Registration Certificate - RC):</strong> कमर्शियल (कमर्शियल येलो प्लेट वाली गाड़ी) रजिस्ट्रेशन सर्टिफिकेट।
                  </li>
                  <li>
                    <strong className="text-white">• वाहन बीमा (Vehicle Insurance):</strong> गाड़ी का वैध कॉमर्शियल कॉम्प्रिहेंसिव इंश्योरेंस।
                  </li>
                  <li>
                    <strong className="text-white">• परमिट (Permit):</strong> कमर्शियल या टूरिस्ट टैक्सी परमिट / कॉन्ट्रैक्ट कैरिज परमिट।
                  </li>
                  <li>
                    <strong className="text-white">• पॉल्यूशन सर्टिफिकेट (PUC):</strong> प्रदूषण नियंत्रण प्रमाण पत्र।
                  </li>
                  <li>
                    <strong className="text-white">• फिटनेस सर्टिफिकेट (Fitness Certificate):</strong> ट्रांसपोर्ट अथॉरिटी (RTO) द्वारा जारी वाहन का फिटनेस प्रमाण पत्र।
                  </li>
                </ul>
              </div>

              {/* Category 3 */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <h4 className="text-sm font-extrabold text-emerald-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>3. बैंक और भुगतान संबंधित दस्तावेज (Payment & Bank Details)</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  <li>
                    <strong className="text-white">• पैन कार्ड (PAN Card):</strong> ओनर / वाहन मालिक का पैन कार्ड।
                  </li>
                  <li>
                    <strong className="text-white">• बैंक खाता विवरण (Bank Details):</strong> अर्निंग्स के ट्रांसफर के लिए बैंक पासबुक की कॉपी या कैंसल चेक (Cancelled Cheque)।
                  </li>
                </ul>
              </div>

              {/* Other Requirements */}
              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                <h4 className="text-sm font-extrabold text-purple-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>अन्य जरूरतें (Smartphone & Fleet)</span>
                </h4>
                <ul className="space-y-1.5 pl-2">
                  <li>
                    <strong className="text-white">• स्मार्टफोन आवश्यकता:</strong> ड्राइवर के पास एंड्रॉइड या आईओएस वाला एक स्मार्टफोन होना चाहिए जिसपर ओला/उबर पार्टनर ऐप ठीक से काम कर सके।
                  </li>
                  <li>
                    <strong className="text-white">• फ्लीट / ट्रांसपोर्ट पार्टनर:</strong> यदि आप अपनी ट्रांसपोर्ट या लॉजिस्टिक्स कंपनी/फ्लीट जोड़ रहे हैं, तो जीएसटी (GST) और ट्रेड सर्टिफिकेट।
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-[#FF8C00] text-black font-black text-xs hover:bg-orange-600 shadow-md"
              >
                समझ गया, दस्तावेज अपलोड करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
