import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Scale,
  RefreshCw,
  Building,
  Printer,
  Search,
  CheckCircle2,
  Lock,
  PhoneCall,
  Mail,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Download,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Logo } from './Logo';

export type PolicyTab = 'terms' | 'master_fare' | 'privacy' | 'refund' | 'insurance' | 'contact';

interface LegalPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
  onAcceptAndClose?: () => void;
  showAcceptButton?: boolean;
}

export const LegalPoliciesModal: React.FC<LegalPoliciesModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'terms',
  onAcceptAndClose,
  showAcceptButton = false,
}) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Download printable formal legal document PDF
  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFillColor(18, 18, 18);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setFillColor(255, 140, 0);
    doc.rect(0, 32, 210, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SAWARI SETU PRIVATE LIMITED', 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(255, 179, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Legal & Regulatory Policies Document (T&C, Privacy & Refund)', 14, 24);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CORPORATE LEGAL DISCLOSURE & STATUTORY COMPLIANCE', 14, 45);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Entity: Sawari Setu Private Limited | CIN: U60200UP2024PTC189201', 14, 52);
    doc.text('GSTIN: 09AAACS8920K1Z4 | Reg. Office: Dashmi Ka Bag, Sirsa, Meja, Prayagraj - 212305', 14, 58);
    doc.text('24x7 Grievance Helpline: +91 9450985355 | Email: sawarisetu@gmail.com', 14, 64);

    doc.setDrawColor(220, 220, 220);
    doc.line(14, 69, 196, 69);

    doc.setFont('helvetica', 'bold');
    doc.text('1. Terms & Conditions Summary:', 14, 78);
    doc.setFont('helvetica', 'normal');
    doc.text(
      '- Motor Vehicle Aggregator Guidelines 2020 & Carriage by Road Act 2007 compliant.',
      20,
      85
    );
    doc.text('- Dynamic fare transparency, zero surge exploitation, helmet/seatbelt compulsory.', 20, 91);
    doc.text('- Passenger & goods carriage governed under Prayagraj jurisdiction.', 20, 97);

    doc.setFont('helvetica', 'bold');
    doc.text('2. Privacy & Data Protection (DPDP Act 2023):', 14, 110);
    doc.setFont('helvetica', 'normal');
    doc.text('- 256-bit AES encryption at rest and TLS 1.3 in transit.', 20, 117);
    doc.text('- 3-5 Year statutory trip log retention for Motor Vehicle Act and GST compliance.', 20, 123);
    doc.text('- No third-party data selling; strict user consent architecture.', 20, 129);

    doc.setFont('helvetica', 'bold');
    doc.text('3. Cancellation & Refund Policy:', 14, 142);
    doc.setFont('helvetica', 'normal');
    doc.text('- 3-minute free cancellation window from booking time.', 20, 149);
    doc.text('- 100% full refund on driver non-arrival within 7 minutes.', 20, 155);
    doc.text('- UPI refunds credited within 2-4 hours; card refunds in 3-5 business days.', 20, 161);

    doc.setFont('helvetica', 'bold');
    doc.text('4. Transit Insurance & Claims:', 14, 174);
    doc.setFont('helvetica', 'normal');
    doc.text('- Up to Rs. 5,00,000 accidental passenger protection on all active trips.', 20, 181);
    doc.text('- Goods transit coverage based on declared consignment value & LR slip.', 20, 187);

    doc.setDrawColor(255, 140, 0);
    doc.roundedRect(130, 220, 65, 26, 2, 2, 'D');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 140, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('SAWARI SETU LEGAL SEAL', 135, 229);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorized Legal Counsel', 135, 236);
    doc.text('Ref: SS-LAW-2026-V1', 135, 242);

    doc.save('SawariSetu_Legal_Policies.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Official Logo */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-zinc-900 via-amber-950/30 to-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showTagline={false} inline={true} />
            <div className="border-l border-zinc-800 pl-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white">
                  कानूनी नीतियां व सेवा शर्तें
                </h2>
                <span className="text-[10px] bg-amber-500/20 text-[#FF8C00] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 hidden sm:inline-block">
                  संस्करण 2026.1 (वैधानिक मान्य)
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Terms of Service • Privacy Policy • Refund & Cancellation • Transit Insurance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold transition-all shadow-sm"
              title="कानूनी दस्तावेज (PDF) डाउनलोड करें"
            >
              <Download className="w-4 h-4 text-[#FF8C00]" />
              <span>डाउनलोड PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corporate Disclosure Banner */}
        <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-300">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-[#FF8C00]" />
            <span>
              <strong>सवारी सेतु प्राइवेट लिमिटेड</strong> (CIN: U60200UP2024PTC189201 | GSTIN: 09AAACS8920K1Z4)
            </span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <span>मुख्यालय: दशमी का बाग, सिरसा, मेजा, प्रयागराज - 212305</span>
            <span>हेल्पलाइन: <strong>9450985355</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 pb-1 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[
              { id: 'master_fare', label: 'मास्टर किराया नीति', sub: 'Master Fare Structure', icon: Scale },
              { id: 'terms', label: 'नियम एवं शर्तें', sub: 'Terms & Conditions', icon: FileText },
              { id: 'privacy', label: 'गोपनीयता नीति', sub: 'Privacy Policy', icon: Lock },
              { id: 'refund', label: 'रिफंड व कैंसिलेशन', sub: 'Refund Policy', icon: RefreshCw },
              { id: 'insurance', label: 'पारगमन बीमा', sub: 'Insurance & Claims', icon: ShieldCheck },
              { id: 'contact', label: 'शिकायत निवारण', sub: 'Grievance Officer', icon: Building },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as PolicyTab)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-[#FF8C00] text-black border-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleDownloadPdf}
            className="sm:hidden p-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-800"
            title="PDF डाउनलोड"
          >
            <Download className="w-4 h-4 text-[#FF8C00]" />
          </button>
        </div>

        {/* Main Legal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* TAB 0: MASTER FARE STRUCTURE (सवारी सेतु फाइनल किराया और संचालन नीति) */}
          {activeTab === 'master_fare' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Scale className="w-5 h-5 text-[#FF8C00] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-base">
                    सवारी सेतु (Savari Setu) - फाइनल किराया और संचालन नीति (Master Fare Structure)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    यह नीति सवारी सेतु के सभी प्रत्यक्ष व शेयरिंग वाहनों, चालकों, उपयोगकर्ताओं व फ्लीट ऑपरेटरों पर पूर्णतः बाध्यकारी है।
                  </p>
                </div>
              </div>

              {/* 1. सामान्य नियम और कमीशन नीति */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-[#FF8C00] flex items-center gap-2">
                  <span>1. सामान्य नियम और कमीशन नीति (General Rules & Commission Policy)</span>
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800">
                    <strong className="text-amber-400 block mb-1">कमीशन नीति (Commission Policy):</strong>
                    <p>• <strong>शुरुआती 6 महीने:</strong> कंपनी का मार्जिन <strong>0%</strong> रहेगा (राइड का 100% पैसा ड्राइवर को मिलेगा)।</p>
                    <p>• <strong>6 महीने बाद:</strong> कुल किराए में से <strong>15%</strong> हिस्सा कंपनी का डिडक्शन होगा और <strong>85%</strong> ड्राइवर को मिलेगा।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800">
                    <strong className="text-emerald-400 block mb-1">टोल टैक्स (Toll Tax Guarantee):</strong>
                    <p>• रूट पर पड़ने वाला टोल टैक्स कुल किराए के अंदर ही शामिल (Include) रहेगा। ग्राहक से कोई भी टोल टैक्स अलग से नहीं वसूला जाएगा।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800">
                    <strong className="text-blue-400 block mb-1">सर्ज चार्ज (खराब मौसम और नाइट):</strong>
                    <p>• <strong>खराब मौसम सर्ज:</strong> बारिश या खराब मौसम डिटेक्ट होने पर सीधे <strong>₹200 अतिरिक्त</strong> जुड़ेंगे।</p>
                    <p>• <strong>नाइट आवर्स सर्ज:</strong> तय नाइट आवर्स (रात्रि 10:00 बजे से प्रातः 06:00 बजे तक) में सफर करने पर भी सीधे <strong>₹200 अतिरिक्त</strong> जुड़ेंगे।</p>
                  </div>
                </div>
              </div>

              {/* 2. मोटरसाइकिल (Bike Taxi) */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-amber-400 flex items-center gap-2">
                  <span>2. मोटरसाइकिल (Bike Taxi) - [केवल डायरेक्ट बुकिंग]</span>
                </h4>
                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs">
                  <p>• <strong>अधिकतम दूरी सीमा:</strong> अधिकतम 40 किलोमीटर</p>
                  <p>• <strong>किराया स्ट्रक्चर:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                    <li><strong>0 से 2 किलोमीटर:</strong> फिक्स ₹50 (बेस फेयर)</li>
                    <li><strong>2 किलोमीटर के बाद:</strong> ₹10 प्रति किलोमीटर</li>
                  </ul>
                </div>
              </div>

              {/* 3. बैटरी ई-रिक्शा (Battery E-Rickshaw) */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-cyan-400 flex items-center gap-2">
                  <span>3. बैटरी ई-रिक्शा (Battery E-Rickshaw) - [शेयर और डायरेक्ट दोनों]</span>
                </h4>
                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs">
                  <p>• <strong>अधिकतम दूरी सीमा:</strong> अधिकतम 20 किलोमीटर</p>
                  <p>• <strong>किराया:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                    <li><strong>शेयरिंग मोड (4-5 किमी तक):</strong> ₹20 प्रति सवारी (फिक्स)</li>
                    <li><strong>डायरेक्ट मोड (Full Book):</strong> बेस फेयर ₹25 + लगभग ₹10 प्रति किलोमीटर</li>
                  </ul>
                </div>
              </div>

              {/* 4. ऑटो रिक्शा (Auto Rickshaw) */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-yellow-400 flex items-center gap-2">
                  <span>4. ऑटो रिक्शा (Auto Rickshaw) - [केवल डायरेक्ट बुकिंग]</span>
                </h4>
                <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5 text-xs">
                  <p>• <strong>अधिकतम दूरी सीमा:</strong> कोई पाबंदी नहीं (सामान्य मध्यम दूरी)</p>
                  <p>• <strong>किराया स्ट्रक्चर:</strong></p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                    <li><strong>बेस फेयर:</strong> ₹30</li>
                    <li><strong>प्रति किलोमीटर चार्ज:</strong> ₹13 प्रति किलोमीटर</li>
                    <li><strong>न्यूनतम किराया:</strong> ₹45 (न्यूनतम गारंटी)</li>
                  </ul>
                </div>
              </div>

              {/* 5. कार सेवाएं (Cars - Mini, Sedan, SUV) */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-emerald-400 flex items-center gap-2">
                  <span>5. कार सेवाएं (Cars - Mini, Sedan, SUV / 4, 5, 6, 7 सीटर) - [केवल डायरेक्ट बुकिंग]</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {/* A. 4 सीटर और 5 सीटर कारें */}
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5">
                    <strong className="text-white block">A. 4 सीटर और 5 सीटर कारें (Mini & Sedan):</strong>
                    <p>• <strong>बेस फेयर (0 से 5 किलोमीटर):</strong> फिक्स ₹200 (टोल शामिल)</p>
                    <p>• <strong>डिस्टेंस स्लैब (सामान्य किराया):</strong></p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                      <li>5.1 से 50 किलोमीटर की रेंज: <strong>₹40 प्रति किलोमीटर</strong></li>
                      <li>50.1 से 100 किलोमीटर की रेंज: <strong>₹35 प्रति किलोमीटर</strong></li>
                      <li>100 किलोमीटर से ऊपर (100+ km): <strong>₹30 प्रति किलोमीटर</strong></li>
                    </ul>
                  </div>

                  {/* B. 6 सीटर और 7 सीटर कारें */}
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1.5">
                    <strong className="text-white block">B. 6 सीटर और 7 सीटर कारें (SUV / MUV):</strong>
                    <p>• <strong>बेस फेयर (0 से 5 किलोमीटर):</strong> फिक्स ₹200 (टोल शामिल)</p>
                    <p>• <strong>डिस्टेंस स्लैब (सामान्य किराया):</strong></p>
                    <ul className="list-disc pl-5 space-y-1 text-zinc-300">
                      <li>5.1 से 50 किलोमीटर की रेंज: <strong>₹40 प्रति किलोमीटर</strong></li>
                      <li>50 किलोमीटर से ऊपर (50+ km): <strong>₹35 प्रति किलोमीटर</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 6. विशेष नवाचार एवं संचालन सुविधाएं (Special Innovations & Value Additions) */}
              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <h4 className="font-extrabold text-white text-sm text-[#FF8C00] flex items-center gap-2">
                  <span>6. विशेष नवाचार एवं संचालन सुविधाएं (Special Features)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                    <strong className="text-amber-400 block">⚡ त्वरित राइड बुकिंग (Instant 1-Tap Booking):</strong>
                    <p className="text-zinc-300">• नजदीकी सत्यापित ऑटो, बाइक व कैब सेकंड्स में उपलब्ध।</p>
                    <p className="text-zinc-400 text-[11px]">• 0% हिडन चार्ज, लाइव जीपीएस ट्रैकिंग और सुरक्षित यात्रा।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                    <strong className="text-emerald-400 block">💬 व्हाट्सएप डायरेक्ट बॉट (WhatsApp Bot):</strong>
                    <p className="text-zinc-300">• 9450985355 पर 1-क्लिक बुकिंग व लाइव अपडेट्स।</p>
                    <p className="text-zinc-400 text-[11px]">• बिना ऐप डाउनलोड किए सीधे मैसेज से तुरंत वाहन बुक करें।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                    <strong className="text-cyan-400 block">🔄 वापसी ट्रिप डिस्काउंट (Return Trip Saver):</strong>
                    <p className="text-zinc-300">• खाली वापसी रूट पर 40% तक की भारी बचत।</p>
                    <p className="text-zinc-400 text-[11px]">• ग्राहक को कम खर्च और ड्राइवर को शून्य खाली किलोमीटर।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1">
                    <strong className="text-purple-400 block">📅 एडवांस शेड्यूल (Advance Scheduling):</strong>
                    <p className="text-zinc-300">• आगामी तारीख व मनपसंद समय पर पूर्व-निर्धारित सफर।</p>
                    <p className="text-zinc-400 text-[11px]">• ट्रेन, फ्लाइट व सुबह की यात्रा के लिए समयबद्ध वाहन आवंटन।</p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/50 border border-zinc-800 space-y-1 sm:col-span-2">
                    <strong className="text-rose-400 block">🛣️ आउटस्टेशन राइड्स (Outstation Intercity Travel):</strong>
                    <p className="text-zinc-300">• प्रयागराज से वाराणसी, लखनऊ, अयोध्या, रीवा आदि के लिए वन-वे व राउंड-ट्रिप।</p>
                    <p className="text-zinc-400 text-[11px]">• टोल टैक्स रूट में शामिल, एसी कारें, पारदर्शी स्लैब व कोई गुप्त शुल्क नहीं।</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <FileText className="w-5 h-5 text-[#FF8C00] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    1. सेवा अनुबंध एवं मंच का दायरा (Scope of Platform)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    सवारी सेतु (Sawari Setu) मोटर वाहन एग्रीगेटर दिशानिर्देश 2020 एवं सूचना प्रौद्योगिकी अधिनियम 2000 की धारा 79 के तहत एक डिजिटल एग्रीगेटर मंच है। यह यात्रियों, माल प्रेषकों और स्वतंत्र अधिकृत वाहन चालकों/मालिकों को सुरक्षित रूप से जोड़ता है।
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">
                  2. उपयोगकर्ता पात्रता एवं पंजीकरण दायित्व (User Eligibility)
                </h4>
                <p>
                  • केवल 18 वर्ष या उससे अधिक आयु के व्यक्ति ही सवारी सेतु पर खाता बनाने व बुकिंग करने के पात्र हैं।
                </p>
                <p>
                  • उपयोगकर्ता यह वचन देता है कि पंजीकरण के समय प्रदान किया गया नाम, मोबाइल नंबर व पहचान सत्य और सटीक है।
                </p>
                <p>
                  • एक मोबाइल नंबर या ईमेल से केवल एक वैध खाता संचालित किया जा सकता है।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">
                  3. किराया निर्धारण एवं भुगतान (Fares, Tolls & Payments)
                </h4>
                <p>
                  • <strong>पारदर्शी किराया:</strong> बुकिंग से पूर्व प्रदर्शित अनुमानित किराया मूल दूरी, अनुमानित समय और वाहन प्रकार पर आधारित होता है।
                </p>
                <p>
                  • <strong>टोल एवं पार्किंग:</strong> यात्रा के दौरान आने वाले वास्तविक टोल टैक्स व पार्किंग शुल्क ग्राहक द्वारा देय होंगे, जो डिजिटल रसीद में विधिवत जोड़े जाएंगे।
                </p>
                <p>
                  • <strong>शून्य अनुचित सर्ज:</strong> त्योहारों व बारिश में भी किराया राज्य परिवहन विभाग द्वारा निर्धारित अधिकतम दरों के भीतर ही रहेगा।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">
                  4. माल ढुलाई एवं प्रतिबंधित वस्तुएं (Goods Carriage & Prohibited Items)
                </h4>
                <p>
                  • <strong>Carriage by Road Act, 2007:</strong> माल परिवहन के तहत किसी भी प्रकार का अवैध माल, विस्फोटक, ज्वलनशील पदार्थ, अवैध हथियार, तस्करी का सामान या नशीले पदार्थ ले जाना पूर्णतः दंडनीय अपराध है।
                </p>
                <p>
                  • माल प्रेषक को प्रत्येक कमर्शियल लोड का वास्तविक वजन, श्रेणी व घोषित मूल्य सही दर्ज करना अनिवार्य है।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-amber-400">
                  5. दायित्व सीमा एवं कानूनी क्षेत्राधिकार (Jurisdiction)
                </h4>
                <p>
                  • किसी भी प्रकार के कानूनी विवाद, मध्यस्थता या दावे की स्थिति में केवल <strong>प्रयागराज, उत्तर प्रदेश स्थित न्यायालयों</strong> का ही अनन्य क्षेत्राधिकार (Exclusive Jurisdiction) होगा।
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-start gap-3">
                <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    गोपनीयता नीति (DPDP Act 2023 एवं IT Act 2000 अनुपालन)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    सवारी सेतु आपकी व्यक्तिगत जानकारी और जीपीएस लोकेशन डेटा की गोपनीयता की पूर्ण रक्षा हेतु 256-Bit एन्क्रिप्शन मानकों का पालन करता है।
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-cyan-400">
                  1. एकत्रित की जाने वाली जानकारी (Data Collection)
                </h4>
                <p>
                  • <strong>जीपीएस लोकेशन डेटा:</strong> सुरक्षित पिकअप, ड्राइवर डिस्पैच, लाइव नेविगेशन और आपातकालीन SOS सुरक्षा हेतु सटीक जीपीएस निर्देशांक।
                </p>
                <p>
                  • <strong>पहचान डेटा:</strong> नाम, सत्यापित मोबाइल नंबर, ईमेल आईडी और बुकिंग इतिहास।
                </p>
                <p>
                  • <strong>ड्राइवर व फ्लीट डेटा:</strong> ड्राइविंग लाइसेंस (DL), वाहन RC, पैन कार्ड और वाणिज्यिक बीमा।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-cyan-400">
                  2. डेटा प्रतिधारण नीति (3 से 5 वर्ष कानूनी संग्रह)
                </h4>
                <p>
                  • मोटर वाहन अधिनियम और GST e-Way Bill वैधानिक प्रावधानों के अनुसार, समस्त राइड ट्रैक्स, डिजिटल इनवॉइस और पेमेंट लॉग्स Firebase Firestore में <strong>3 से 5 वर्षों के लिए सुरक्षित</strong> संग्रहीत किए जाते हैं।
                </p>
                <p>
                  • हम आपका व्यक्तिगत डेटा कभी भी किसी तीसरे पक्ष को विज्ञापन या टेलीमार्केटिंग के लिए नहीं बेचते हैं।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-cyan-400">
                  3. उपयोगकर्ता के अधिकार (User Data Rights)
                </h4>
                <p>
                  • आप किसी भी समय अपनी प्रोफ़ाइल की समीक्षा कर सकते हैं अथवा <code>sawarisetu@gmail.com</code> पर ईमेल भेजकर अपना खाता व डेटा डिलीट करने का अनुरोध कर सकते हैं।
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    रिफंड एवं रद्दीकरण नीति (Refund & Cancellation Policy)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    सवारी सेतु निष्पक्ष, पारदर्शी और त्वरित रिफंड प्रणाली प्रदान करता है। किसी भी असंतोषजनक स्थिति में आपका पैसा सुरक्षित है।
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-emerald-400">
                  1. निःशुल्क रद्दीकरण विंडो (Free Cancellation Window)
                </h4>
                <p>
                  • <strong>सवारी बुकिंग:</strong> राइड कन्फर्म होने के <strong>3 मिनट</strong> के भीतर रद्द करने पर कोई रद्दीकरण शुल्क (₹0) नहीं लगेगा।
                </p>
                <p>
                  • <strong>माल परिवहन:</strong> माल गाड़ी बुक होने के <strong>5 मिनट</strong> के भीतर निःशुल्क रद्दीकरण संभव है।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-emerald-400">
                  2. रद्दीकरण शुल्क नियम (Cancellation Fees)
                </h4>
                <p>
                  • यदि ड्राइवर पिकअप स्थान पर पहुँच चुका है और ग्राहक 5 मिनट तक नहीं आता अथवा बिना उचित कारण के राइड रद्द करता है:
                  <br />
                  - बाइक: ₹20 • ऑटो / ई-रिक्शा: ₹30 • कार: ₹50 • छोटा हाथी / लोडर: ₹100
                </p>
                <p>
                  • <strong>ड्राइवर द्वारा देरी:</strong> यदि आवंटित चालक 7 मिनट के भीतर पिकअप की ओर नहीं बढ़ता, तो ग्राहक बिना किसी शुल्क के तुरंत राइड रद्द कर सकता है और कंपनी ग्राहक को ₹25 का डिस्काउंट कूपन प्रदान करेगी।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-emerald-400">
                  3. रिफंड समयावधि (Refund Settlement Timelines)
                </h4>
                <p>
                  • <strong>UPI / वॉलेट भुगतान:</strong> रद्दीकरण की पुष्टि के <strong>2 से 4 घंटे</strong> के भीतर मूल खाते में वापस।
                </p>
                <p>
                  • <strong>डेबिट / क्रेडिट कार्ड / नेट बैंकिंग:</strong> बैंकिंग कार्य दिवसों के अनुसार <strong>3 से 5 व्यावसायिक दिनों</strong> में सीधे आपके बैंक खाते में।
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: TRANSIT INSURANCE */}
          {activeTab === 'insurance' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    पारगमन सुरक्षा बीमा एवं दावा नियम (Transit Insurance Policy)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    प्रत्येक यात्री यात्रा और चयनित माल कंसाइनमेंट को व्यापक सुरक्षा कवच प्रदान किया जाता है।
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-purple-400">
                  1. यात्री दुर्घटना सुरक्षा कवच (Passenger Coverage)
                </h4>
                <p>
                  • प्रत्येक एक्टिव राइड के दौरान यात्री को अधिकतम <strong>₹5,00,000 (पाँच लाख रुपये)</strong> तक का आकस्मिक चिकित्सा व क्षतिपूर्ति बीमा कवरेज प्राप्त होता है।
                </p>
                <p>
                  • अस्पताल भर्ती, आपातकालीन एम्बुलेंस सहायता और दुर्घटना क्षतिपूर्ति सम्मिलित है।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-purple-400">
                  2. माल परिवहन बीमा (Cargo Transit Insurance)
                </h4>
                <p>
                  • लॉजिस्टिक्स बुकिंग के समय 0.35% प्रीमियम पर माल के घोषित मूल्य के बराबर पारगमन बीमा प्राप्त होता है।
                </p>
                <p>
                  • सड़क दुर्घटना, वाहन पलटने, आगजनी अथवा चोरी के मामलों में Lorry Receipt (LR) और e-Way Bill के आधार पर त्वरित दावा निपटान किया जाता है।
                </p>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800">
                <h4 className="font-bold text-white text-xs sm:text-sm text-purple-400">
                  3. दावा दर्ज करने की प्रक्रिया (How to File a Claim)
                </h4>
                <p>
                  • घटना के 24 घंटे के भीतर हेल्पलाइन <strong>9450985355</strong> अथवा <code>sawarisetu@gmail.com</code> पर घटना स्थल की तस्वीरों और ट्रिप आईडी के साथ सूचित करें।
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: GRIEVANCE REDRESSAL */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <Building className="w-5 h-5 text-[#FF8C00] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">
                    कंपनी विवरण एवं वैधानिक शिकायत अधिकारी (Grievance Redressal Officer)
                  </h3>
                  <p className="text-zinc-300 text-xs mt-1">
                    उपभोक्ता संरक्षण अधिनियम 2019 एवं IT Rules 2021 के अनुपालन में नियुक्त अधिकारी।
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Building className="w-4 h-4 text-[#FF8C00]" />
                  <span>सवारी सेतु प्राइवेट लिमिटेड (Sawari Setu Private Limited)</span>
                </div>
                <p className="text-zinc-400">
                  <strong>CIN:</strong> U60200UP2024PTC189201 | <strong>GSTIN:</strong> 09AAACS8920K1Z4
                </p>
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>पंजीकृत कार्यालय: दशमी का बाग, सिरसा, मेजा, प्रयागराज, उत्तर प्रदेश - 212305 (Dashmi Ka Bag, Sirsa, Meja, Prayagraj - 212305)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <PhoneCall className="w-4 h-4 text-[#FF8C00] shrink-0" />
                  <span>24x7 हेल्पलाइन: <strong>+91 9450985355</strong></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>आधिकारिक ईमेल: <strong>sawarisetu@gmail.com</strong></span>
                </div>
                <div className="pt-2 border-t border-zinc-800 text-zinc-400 text-xs">
                  <strong>शिकायत निवारण अधिकारी:</strong> श्री आर. के. वर्मा (कार्यकारी निदेशक, विधिक एवं अनुपालन)
                  <br />
                  शिकायत निवारण समय सीमा: अधिकतम 48 घंटे के भीतर पावती एवं 15 दिनों में पूर्ण समाधान।
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Mandatory Acceptance / Close actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>भारतीय कानून, IT Act 2000 एवं मोटर वाहन नियमों के तहत वैधानिक मान्यता प्राप्त</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {showAcceptButton && onAcceptAndClose ? (
              <button
                onClick={onAcceptAndClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#FF8C00] hover:bg-orange-600 text-black font-extrabold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-black" />
                <span>मैं सभी नियमों व नीतियों से सहमत हूँ (Accept & Continue)</span>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-all border border-zinc-700"
              >
                बंद करें (Close)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
