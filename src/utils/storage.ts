import {
  UserProfile,
  LiveVehicle,
  DriverKycDoc,
  RideBooking,
  LogisticsBooking,
  PaymentGatewayConfig,
  PaymentTransactionRecord,
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_9450',
  name: 'राम प्रकाश वर्मा',
  phone: '9450985355',
  email: 'sawarisetu@gmail.com',
  role: 'passenger',
  isVerified: true,
  city: 'प्रयागराज (Prayagraj)',
  createdAt: '2024-03-10',
};

// Initial realistic live fleet around Lucknow/Delhi hub
export const INITIAL_FLEET: LiveVehicle[] = [
  // Passenger Vehicles
  {
    id: 'veh_p1',
    type: 'passenger',
    subType: 'bike',
    name: 'Honda Shine 125',
    driverName: 'सुरेश कुमार यादव',
    phone: '9876543210',
    lat: 26.8467,
    lng: 80.9462,
    heading: 45,
    speed: 32,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-AK-4421',
    rating: 4.9,
    capacity: '1 सवार',
  },
  {
    id: 'veh_p2',
    type: 'passenger',
    subType: 'auto',
    name: 'Bajaj Compact Auto',
    driverName: 'मोहम्मद इरफ़ान',
    phone: '9876543211',
    lat: 26.852,
    lng: 80.941,
    heading: 120,
    speed: 24,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-BT-7812',
    rating: 4.8,
    capacity: '3 सवारियां',
  },
  {
    id: 'veh_p3',
    type: 'passenger',
    subType: 'erickshaw',
    name: 'Mayuri Eco E-Rickshaw',
    driverName: 'दिनेश पाल',
    phone: '9876543212',
    lat: 26.841,
    lng: 80.952,
    heading: 210,
    speed: 18,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-ER-3914',
    rating: 4.9,
    capacity: '4 सवारियां',
  },
  {
    id: 'veh_p4',
    type: 'passenger',
    subType: 'minicar',
    name: 'Maruti WagonR CNG',
    driverName: 'अमित कुमार सिंह',
    phone: '9876543213',
    lat: 26.861,
    lng: 80.932,
    heading: 90,
    speed: 40,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-CS-9901',
    rating: 5.0,
    capacity: '4 सवारियां (AC)',
  },
  {
    id: 'veh_p5',
    type: 'passenger',
    subType: 'share',
    name: 'Force Trax Cruiser (Share)',
    driverName: 'राकेश तिवारी',
    phone: '9876543214',
    lat: 26.835,
    lng: 80.965,
    heading: 300,
    speed: 28,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-SH-5511',
    rating: 4.7,
    capacity: 'शेयरिंग (प्रति सीट)',
  },
  {
    id: 'veh_w1',
    type: 'passenger',
    subType: 'walker',
    name: 'सवारी सेतु पैदल वॉकर / रनर',
    driverName: 'संजय निषाद (सत्यापित वॉकर)',
    phone: '9450985355',
    lat: 25.2642,
    lng: 82.0912,
    heading: 0,
    speed: 5,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'WALKER-SS-01',
    rating: 4.95,
    capacity: 'दवाई/किराना/पार्सल (10 kg तक)',
  },

  // Logistics Vehicles
  {
    id: 'veh_l1',
    type: 'logistics',
    subType: 'tata_ace',
    name: 'Tata Ace Gold (छोटा हाथी)',
    driverName: 'मनोज कुमार रस्तोगी',
    phone: '9876543215',
    lat: 26.858,
    lng: 80.958,
    heading: 60,
    speed: 35,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-CN-6709',
    rating: 4.9,
    capacity: '750 किग्रा (खुली डाला)',
  },
  {
    id: 'veh_l2',
    type: 'logistics',
    subType: 'loader',
    name: 'Piaggio Ape 3W Loader',
    driverName: 'कलीम अहमद',
    phone: '9876543216',
    lat: 26.843,
    lng: 80.935,
    heading: 180,
    speed: 22,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-LD-2301',
    rating: 4.8,
    capacity: '500 किग्रा लोडर',
  },
  {
    id: 'veh_l3',
    type: 'logistics',
    subType: 'tata_407',
    name: 'Tata 407 LPT High-Deck',
    driverName: 'बलविंदर सिंह',
    phone: '9876543217',
    lat: 26.87,
    lng: 80.92,
    heading: 15,
    speed: 45,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-TK-8890',
    rating: 4.9,
    capacity: '2.5 टन क्षमता',
  },
  {
    id: 'veh_l4',
    type: 'logistics',
    subType: 'truck_14ft',
    name: 'Eicher Pro 14 Ft Container',
    driverName: 'हरप्रीत सिंह',
    phone: '9876543218',
    lat: 26.829,
    lng: 80.915,
    heading: 270,
    speed: 48,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-CT-1414',
    rating: 5.0,
    capacity: '4.0 टन बंद कंटेनर',
  },
  {
    id: 'veh_l5',
    type: 'logistics',
    subType: 'truck_32ft',
    name: 'BharatBenz 32 Ft Multi-Axle',
    driverName: 'जोगिंदर पाल',
    phone: '9876543219',
    lat: 26.885,
    lng: 80.97,
    heading: 85,
    speed: 52,
    isOnline: true,
    currentStatus: 'available',
    vehicleNumber: 'UP32-MX-3232',
    rating: 4.9,
    capacity: '15-20 टन ऑल-इंडिया परमिट',
  },
];

export const INITIAL_KYC_DOCS: DriverKycDoc[] = [
  {
    id: 'doc_1',
    driverName: 'सुरेश कुमार यादव',
    driverPhone: '9876543210',
    docType: 'Driving Licence',
    docNumber: 'UP32 20180019234',
    status: 'approved',
    uploadedAt: '2024-03-01 10:30',
  },
  {
    id: 'doc_2',
    driverName: 'सुरेश कुमार यादव',
    driverPhone: '9876543210',
    docType: 'Commercial Insurance',
    docNumber: 'POL-ICICI-992144',
    status: 'approved',
    uploadedAt: '2024-03-01 10:32',
  },
  {
    id: 'doc_3',
    driverName: 'मनोज कुमार रस्तोगी',
    driverPhone: '9876543215',
    docType: 'Vehicle RC',
    docNumber: 'UP32CN6709-RC-V2',
    status: 'approved',
    uploadedAt: '2024-03-02 14:15',
  },
  {
    id: 'doc_4',
    driverName: 'वीरेंद्र कुमार मिश्रा',
    driverPhone: '9450985399',
    docType: 'PAN',
    docNumber: 'ABCDE1234F',
    status: 'pending',
    uploadedAt: '2024-03-12 11:40',
  },
  {
    id: 'doc_5',
    driverName: 'वीरेंद्र कुमार मिश्रा',
    driverPhone: '9450985399',
    docType: 'Driving Licence',
    docNumber: 'UP32 20210088122',
    status: 'pending',
    uploadedAt: '2024-03-12 11:42',
  },
];

export const POPULAR_LOCATIONS = [
  { name: 'दशमी का बाग, सिरसा, मेजा, प्रयागराज - 212305 (मुख्यालय)', lat: 25.2642, lng: 82.0912, category: 'Headquarters' },
  { name: 'सिरसा बाजार / गंगा घाट, मेजा, प्रयागराज', lat: 25.2715, lng: 82.0885, category: 'Market' },
  { name: 'मेजा रोड रेलवे स्टेशन, प्रयागराज', lat: 25.2356, lng: 82.0724, category: 'Railway Station' },
  { name: 'सिविल लाइंस बस स्टैंड, प्रयागराज', lat: 25.4528, lng: 81.8344, category: 'City Center' },
  { name: 'प्रयागराज जंक्शन रेलवे स्टेशन', lat: 25.4439, lng: 81.8256, category: 'Transit' },
  { name: 'ट्रांसपोर्ट नगर, धूमनगंज, प्रयागराज', lat: 25.4312, lng: 81.7915, category: 'Logistics Hub' },
  { name: 'हजरतगंज चौराहा, लखनऊ', lat: 26.8467, lng: 80.9462, category: 'City Center' },
  { name: 'चारबाग रेलवे स्टेशन, लखनऊ', lat: 26.8322, lng: 80.9238, category: 'Transit' },
];

export const openWhatsAppHelpline = (message?: string) => {
  const text = encodeURIComponent(
    message || 'नमस्ते सवारी सेतु! मुझे सवारी / माल परिवहन सहायता चाहिए। मोबाइल: 9450985355'
  );
  window.open(`https://wa.me/919450985355?text=${text}`, '_blank');
};

export const INITIAL_SAVED_PLACES = [
  {
    id: 'sp_1',
    name: 'घर (Home)',
    address: 'मकान 42, जानकीपुरम विस्तार, लखनऊ',
    icon: 'home' as const,
    lat: 26.912,
    lng: 80.954,
  },
  {
    id: 'sp_2',
    name: 'दफ्तर (Office)',
    address: 'विभूति खंड, गोमती नगर, साइबर हाइट्स, लखनऊ',
    icon: 'work' as const,
    lat: 26.8631,
    lng: 80.9982,
  },
  {
    id: 'sp_3',
    name: 'थोक गोदाम (Warehouse)',
    address: 'ट्रांसपोर्ट नगर, अमौसी, वेयरहाउस ब्लॉक C-4',
    icon: 'warehouse' as const,
    lat: 26.7725,
    lng: 80.8925,
  },
  {
    id: 'sp_4',
    name: 'सब्जी व फल मंडी (Mandi)',
    address: 'दुबग्गा फल व सब्जी थोक मंडी, लखनऊ',
    icon: 'mandi' as const,
    lat: 26.8795,
    lng: 80.8524,
  },
];

export const INITIAL_COUPONS = [
  {
    code: 'SETU50',
    title: '50% सवारी छूट',
    discountPercentage: 50,
    maxDiscount: 60,
    minFare: 50,
    description: 'ऑटो, बाइक या मिनी कार पर 50% तक छूट',
  },
  {
    code: 'FIRSTSETU',
    title: 'सवारी सेतु स्वागत कूपन',
    flatDiscount: 40,
    maxDiscount: 40,
    minFare: 70,
    description: 'नई सवारी पर फ्लैट ₹40 की बचत',
  },
  {
    code: 'MALMUKT',
    title: 'माल भाड़ा स्पेशल छूट',
    flatDiscount: 150,
    maxDiscount: 150,
    minFare: 500,
    description: 'छोटा हाथी व बड़े ट्रकों के भाड़े पर फ्लैट ₹150 छूट',
  },
  {
    code: 'FESTIVE100',
    title: 'त्योहारी स्पेशल बचत',
    discountPercentage: 20,
    maxDiscount: 100,
    minFare: 200,
    description: 'लंबी दूरी की यात्राओं पर 20% अतिरिक्त बचत',
  },
];

export const INITIAL_TRIP_HISTORY = [
  {
    id: 'RIDE_SS_9021',
    type: 'ride' as const,
    title: 'ऑटो रिक्शा • हजरतगंज से चारबाग',
    date: '05 मार्च 2026, 04:30 PM',
    pickup: 'हजरतगंज चौराहा, लखनऊ',
    drop: 'चारबाग रेलवे स्टेशन, लखनऊ',
    amount: 110,
    vehicle: 'Bajaj Compact Auto',
    vehicleNumber: 'UP32-BT-7812',
    driverName: 'मोहम्मद इरफ़ान',
    status: 'completed' as const,
    rating: 5,
  },
  {
    id: 'LOG_SS_4412',
    type: 'logistics' as const,
    title: 'टाटा एस (छोटा हाथी) • कृषि उपज ढुलाई',
    date: '04 मार्च 2026, 11:15 AM',
    pickup: 'दुबग्गा फल व सब्जी मंडी',
    drop: 'ट्रांसपोर्ट नगर, अमौसी',
    amount: 850,
    vehicle: 'Tata Ace Gold',
    vehicleNumber: 'UP32-CN-6709',
    driverName: 'मनोज कुमार रस्तोगी',
    status: 'completed' as const,
    rating: 5,
  },
  {
    id: 'RIDE_SS_8114',
    type: 'ride' as const,
    title: 'बाइक टैक्सी • गोमती नगर से अमौसी एयरपोर्ट',
    date: '01 मार्च 2026, 08:20 AM',
    pickup: 'विभूति खंड, गोमती नगर',
    drop: 'चौधरी चरण सिंह अमौसी एयरपोर्ट',
    amount: 175,
    vehicle: 'Honda Shine 125',
    vehicleNumber: 'UP32-AK-4421',
    driverName: 'सुरेश कुमार यादव',
    status: 'completed' as const,
    rating: 4.8,
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'सवारी सेतु में स्वागत है! 🎉',
    message: 'सवारी और माल ढुलाई पर फ्लैट ₹50 कैशबैक पाने के लिए कूपन SETU50 का उपयोग करें।',
    time: 'अभी',
    type: 'offer' as const,
    read: false,
  },
  {
    id: 'notif_2',
    title: 'सुरक्षा एडवाइजरी 🛡️',
    message: 'प्रत्येक सवारी सेतु यात्रा पारगमन सुरक्षा बीमा से कवर है। आपातकाल में SOS बटन का उपयोग करें।',
    time: '2 घंटे पहले',
    type: 'safety' as const,
    read: false,
  },
  {
    id: 'notif_3',
    title: 'RTO लाइसेंस व बीमा अपडेटेड',
    message: 'आपके शहर में 100% सत्यापित चालक साथी सक्रिय हैं।',
    time: 'कल',
    type: 'system' as const,
    read: true,
  },
];

export const DEFAULT_RIDE_FARES: any[] = [
  { mode: 'walker', title: 'पैदल वॉकर (Walker Runner)', baseFare: 25, perKmRate: 12, maxKm: 5, note: 'दवाई/किराना/कुली 0-1 किमी ₹25, फिर ₹12/किमी (मैक्स 5 किमी)' },
  { mode: 'bike', title: 'मोटरसाइकिल (Bike Taxi)', baseFare: 50, perKmRate: 10, maxKm: 40, note: '0-2 किमी ₹50 फिक्स, फिर ₹10/किमी (अधिकतम 40 किमी)' },
  { mode: 'erickshaw_share', title: 'ई-रिक्शा शेयर (Share)', baseFare: 20, perKmRate: 0, maxKm: 20, note: '4-5 किमी तक ₹20 प्रति सवारी फिक्स' },
  { mode: 'erickshaw_direct', title: 'ई-रिक्शा डायरेक्ट (Full)', baseFare: 25, perKmRate: 10, maxKm: 20, note: 'बेस ₹25 + ₹10 प्रति किमी (अधिकतम 20 किमी)' },
  { mode: 'auto', title: 'ऑटो रिक्शा (Auto)', baseFare: 30, perKmRate: 13, maxKm: null, note: 'बेस ₹30, ₹13/किमी, न्यूनतम किराया ₹45' },
  { mode: 'car_4_5', title: '4 व 5 सीटर कार (Mini & Sedan)', baseFare: 200, perKmRate: 40, maxKm: null, note: '0-5 किमी ₹200 (टोल शामिल), 5-50 किमी ₹40, 50-100 किमी ₹35, 100+ किमी ₹30' },
  { mode: 'car_6_7', title: '6 व 7 सीटर कार (SUV / MUV)', baseFare: 200, perKmRate: 40, maxKm: null, note: '0-5 किमी ₹200 (टोल शामिल), 5-50 किमी ₹40, 50+ किमी ₹35' },
];

export const DEFAULT_LOGISTICS_FARES: any[] = [
  { vehicleType: 'walker', title: 'पैदल वॉकर (स्मॉल पार्सल/दवाई)', baseFreight: 25, perKmRate: 12 },
  { vehicleType: 'loader', title: '3W लोडर', baseFreight: 250, perKmRate: 20 },
  { vehicleType: 'tata_ace', title: 'छोटा हाथी (Tata Ace)', baseFreight: 350, perKmRate: 25 },
  { vehicleType: 'tata_407', title: 'टाटा 407 (Tata 407)', baseFreight: 650, perKmRate: 35 },
  { vehicleType: 'truck_14ft', title: '14 फीट ट्रक', baseFreight: 1100, perKmRate: 45 },
  { vehicleType: 'truck_19ft', title: '19 फीट ट्रक', baseFreight: 1800, perKmRate: 60 },
  { vehicleType: 'truck_32ft', title: '32 फीट मल्टी-एक्सल', baseFreight: 3200, perKmRate: 85 },
];

export const getStoredRideFares = (): any[] => {
  try {
    const val = localStorage.getItem('sawari_ride_fares');
    return val ? JSON.parse(val) : DEFAULT_RIDE_FARES;
  } catch {
    return DEFAULT_RIDE_FARES;
  }
};

export const saveStoredRideFares = (fares: any[]) => {
  localStorage.setItem('sawari_ride_fares', JSON.stringify(fares));
};

export const getStoredLogisticsFares = (): any[] => {
  try {
    const val = localStorage.getItem('sawari_logistics_fares');
    return val ? JSON.parse(val) : DEFAULT_LOGISTICS_FARES;
  } catch {
    return DEFAULT_LOGISTICS_FARES;
  }
};

export const saveStoredLogisticsFares = (fares: any[]) => {
  localStorage.setItem('sawari_logistics_fares', JSON.stringify(fares));
};

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewayConfig = {
  activeGateway: 'all',
  environment: 'sandbox',
  merchantUpiId: 'sawarisetu@sbi',
  merchantName: 'सवारी सेतु प्राइवेट लिमिटेड (Sawari Setu Pvt Ltd)',
  merchantPhone: '9450985355',
  merchantEmail: 'sawarisetu@gmail.com',
  razorpayKeyId: 'rzp_test_SawariSetu2026',
  razorpayKeySecret: 'sec_test_sawarisetu_secret',
  cashfreeAppId: 'CF_TEST_SAWARISETU',
  cashfreeSecretKey: 'sec_cf_test_key_sample',
  platformCommissionPercent: 0,
  isLaunchOfferActive: true,
  bankAccount: {
    accountHolder: 'सवारी सेतु प्राइवेट लिमिटेड',
    accountNumber: '94509853551234',
    ifscCode: 'SBIN0001234',
    bankName: 'भारतीय स्टेट बैंक (SBI)',
    branch: 'प्रयागराज मेन शाखा',
  },
  payoutSchedule: 'daily_midnight',
};

export const INITIAL_PAYMENT_TRANSACTIONS: PaymentTransactionRecord[] = [
  {
    id: 'tx_pay_9011',
    orderId: 'ORD_SS_9011',
    bookingRef: 'RIDE_SS_9451',
    amount: 110,
    currency: 'INR',
    paymentMethod: 'upi_qr',
    status: 'captured',
    customerName: 'राम प्रकाश वर्मा',
    customerPhone: '9450985355',
    customerEmail: 'sawarisetu@gmail.com',
    driverShareAmount: 110,
    platformFeeAmount: 0,
    timestamp: 'आज, 10:45 AM',
    receiptNumber: 'REC-2026-9011',
    gstin: '09AAECS9450P1Z2',
    hsnSacCode: '9964 (यात्री परिवहन सेवा)',
  },
  {
    id: 'tx_pay_9012',
    orderId: 'ORD_SS_9012',
    bookingRef: 'LOG_SS_4412',
    amount: 850,
    currency: 'INR',
    paymentMethod: 'upi_intent',
    status: 'captured',
    customerName: 'राजेश अग्रहरि',
    customerPhone: '9876543210',
    customerEmail: 'rajesh@agrahari.in',
    driverShareAmount: 850,
    platformFeeAmount: 0,
    timestamp: 'कल, 04:20 PM',
    receiptNumber: 'REC-2026-9012',
    gstin: '09AAECS9450P1Z2',
    hsnSacCode: '9965 (माल परिवहन सेवा)',
  },
];

export const getStoredPaymentConfig = (): PaymentGatewayConfig => {
  try {
    const val = localStorage.getItem('sawari_payment_config');
    if (!val) return DEFAULT_PAYMENT_CONFIG;
    return { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(val) };
  } catch {
    return DEFAULT_PAYMENT_CONFIG;
  }
};

export const saveStoredPaymentConfig = (config: PaymentGatewayConfig) => {
  localStorage.setItem('sawari_payment_config', JSON.stringify(config));
};

export const getStoredPaymentTransactions = (): PaymentTransactionRecord[] => {
  try {
    const val = localStorage.getItem('sawari_payment_transactions');
    return val ? JSON.parse(val) : INITIAL_PAYMENT_TRANSACTIONS;
  } catch {
    return INITIAL_PAYMENT_TRANSACTIONS;
  }
};

export const saveStoredPaymentTransaction = (tx: PaymentTransactionRecord) => {
  try {
    const current = getStoredPaymentTransactions();
    const updated = [tx, ...current.filter((item) => item.id !== tx.id)];
    localStorage.setItem('sawari_payment_transactions', JSON.stringify(updated.slice(0, 50)));
  } catch (e) {
    console.error('Error saving transaction', e);
  }
};

