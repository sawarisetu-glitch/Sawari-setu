export type ServiceTab = 'ride' | 'logistics' | 'driver' | 'admin';

export type RideMode =
  | 'share'
  | 'direct'
  | 'erickshaw'
  | 'auto'
  | 'bike'
  | 'minicar'
  | 'erickshaw_share'
  | 'erickshaw_direct'
  | 'car_4_5'
  | 'car_6_7'
  | 'suv'
  | 'walker';

export type LogisticsVehicleType =
  | 'loader'
  | 'tata_ace'
  | 'tata_407'
  | 'truck_14ft'
  | 'truck_19ft'
  | 'truck_32ft'
  | 'walker';

export interface WalkerBooking {
  id: string;
  userName: string;
  userPhone: string;
  errandType: 'medicine' | 'grocery' | 'food' | 'parcel' | 'market_shopping' | 'porter_luggage' | 'other';
  errandTitle: string;
  itemDescription: string;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  totalFare: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  otp: string;
  walkerName: string;
  walkerPhone: string;
  walkerRating: number;
  estimatedTimeMins: number;
  bookingTime: string;
  paymentMethod: 'cash' | 'upi' | 'wallet';
  paymentStatus: 'pending' | 'paid';
  createdAt?: string;
  completedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'passenger' | 'driver' | 'admin' | 'fleet_owner';
  isVerified: boolean;
  city: string;
  createdAt: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  loyaltyPoints?: number;
}

export interface LoyaltyTransaction {
  id: string;
  type: 'earned' | 'redeemed';
  points: number;
  reason: string;
  referenceId?: string;
  timestamp: string;
}

export interface LoyaltyAccount {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  transactions: LoyaltyTransaction[];
}

export interface RideBooking {
  id: string;
  passengerName: string;
  passengerPhone: string;
  pickup: string;
  pickupCoords: { lat: number; lng: number };
  destination: string;
  destCoords: { lat: number; lng: number };
  mode: RideMode;
  distanceKm: number;
  baseFare: number;
  totalFare: number;
  status: 'searching' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  otp: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  vehicleNumber?: string;
  bookingTime: string;
  paymentMethod: 'upi' | 'cash' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid';
  agreedToSafety: boolean;
  createdAt?: string;
  completedAt?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  discountFromPoints?: number;
  weatherSurge?: number;
  nightSurge?: number;
  tollTaxIncluded?: boolean;
  driverEarningShare?: number;
  commissionDeduction?: number;
  isInitial6Months?: boolean;
  fareBreakdownText?: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
  isOutstation?: boolean;
  outstationType?: 'one_way' | 'round_trip';
  isReturnTripDiscount?: boolean;
  returnTripDiscountAmount?: number;
  bookedViaVoice?: boolean;
  bookedViaWhatsApp?: boolean;
  selectedRouteId?: string;
  trafficCondition?: LiveTrafficInfo;
}

export interface RideFareConfig {
  mode: RideMode;
  title: string;
  baseFare: number;
  perKmRate: number;
}

export interface LogisticsFareConfig {
  vehicleType: LogisticsVehicleType;
  title: string;
  baseFreight: number;
  perKmRate: number;
}

export interface LogisticsBooking {
  id: string;
  senderName: string;
  senderPhone: string;
  pickup: string;
  destination: string;
  goodsDescription: string;
  goodsCategory: string;
  goodsValue: number;
  distanceKm: number;
  vehicleType: LogisticsVehicleType;
  baseFreight: number;
  transitInsuranceOpted: boolean;
  insuranceAmount: number;
  gstAmount: number;
  totalAmount: number;
  status: 'assigned' | 'loading' | 'in_transit' | 'delivered' | 'cancelled';
  ewayBillNumber: string;
  lrNumber: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  bookingTime: string;
  paymentMethod: 'upi' | 'bank_transfer' | 'cash' | 'credit';
  paymentStatus: 'pending' | 'paid';
  completedAt?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  discountFromPoints?: number;
  selectedRouteId?: string;
  trafficCondition?: LiveTrafficInfo;
}

export interface LiveVehicle {
  id: string;
  type: 'passenger' | 'logistics';
  subType: string;
  name: string;
  driverName: string;
  phone: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  isOnline: boolean;
  currentStatus: 'available' | 'busy' | 'offline';
  vehicleNumber: string;
  rating: number;
  capacity?: string;
}

export type KycDocCategory = 'driver' | 'vehicle' | 'bank' | 'fleet';

export type KycDocType =
  // 1. ड्राइवर से जुड़े जरूरी दस्तावेज
  | 'Commercial DL'
  | 'Driving Licence'
  | 'PAN Card'
  | 'PAN'
  | 'Aadhaar Card'
  | 'Aadhaar'
  | 'Address Proof'
  | 'Police Verification'
  | 'Profile Photo'
  // 2. वाहन से जुड़े जरूरी दस्तावेज
  | 'Vehicle RC'
  | 'Vehicle Insurance'
  | 'Commercial Insurance'
  | 'Permit'
  | 'PUC'
  | 'Fitness Certificate'
  // 3. बैंक और भुगतान संबंधित दस्तावेज
  | 'Owner PAN'
  | 'Bank Details'
  // अन्य जरूरतें (फ्लीट / लॉजिस्टिक्स)
  | 'GST / Trade Certificate';

export interface DriverKycDoc {
  id: string;
  driverName: string;
  driverPhone: string;
  driverId?: string;
  category?: KycDocCategory;
  docType: KycDocType;
  docTitle?: string;
  docNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  previewUrl?: string;
  storageUrl?: string;
  fileName?: string;
  fileSize?: string;
  verifiedAt?: string;
  adminNotes?: string;
}

export interface DigitalSlip {
  slipId: string;
  tripId: string;
  driverName: string;
  driverId: string;
  vehicleNumber: string;
  pickup: string;
  drop: string;
  distanceKm: number;
  grossAmount: number;
  driverShare: number;
  platformFee: number;
  commissionPercent?: number;
  schemeTitle?: string;
  paymentMode: string;
  timestamp: string;
  stampSignature: string;
}

export interface CommissionConfig {
  ratePercentage: number;
  isFreePromotion: boolean;
  schemeTitle: string;
  applicableTo: 'all' | 'passenger' | 'logistics';
  notes?: string;
  updatedAt?: string;
}

export interface TripHistoryItem {
  id: string;
  type: 'ride' | 'logistics';
  title: string;
  date: string;
  pickup: string;
  drop: string;
  amount: number;
  vehicle: string;
  vehicleNumber: string;
  driverName: string;
  status: 'completed' | 'cancelled';
  rating?: number;
  rawRide?: RideBooking;
  rawLogistics?: LogisticsBooking;
}

export interface SavedPlace {
  id: string;
  name: string;
  address: string;
  icon: 'home' | 'work' | 'warehouse' | 'mandi' | 'other';
  lat: number;
  lng: number;
}

export interface PromoCoupon {
  code: string;
  title: string;
  discountPercentage?: number;
  flatDiscount?: number;
  minFare: number;
  maxDiscount: number;
  description: string;
}

export interface SupportTicket {
  id: string;
  category: 'lost_item' | 'fare_issue' | 'driver_conduct' | 'insurance_claim' | 'other';
  subject: string;
  description: string;
  tripId?: string;
  status: 'open' | 'investigating' | 'resolved';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'booking' | 'offer' | 'system' | 'safety';
  read: boolean;
}

export interface DriverChatMessage {
  id: string;
  sender: 'passenger' | 'driver';
  text: string;
  time: string;
}

export type TrafficSeverity = 'light' | 'moderate' | 'heavy' | 'severe';

export interface TrafficSegment {
  id: string;
  name: string;
  status: TrafficSeverity;
  color: string;
  speedKmH: number;
  delayMins: number;
  coordinates: [number, number][]; // [lat, lng]
}

export interface AlternativeRouteOption {
  id: string;
  name: string;
  via: string;
  distanceKm: number;
  durationMins: number;
  delayMins: number;
  timeSavingsMins: number;
  status: TrafficSeverity;
  statusLabel: string;
  color: string;
  isRecommended: boolean;
  coordinates: [number, number][];
}

export interface LiveTrafficInfo {
  overallStatus: TrafficSeverity;
  statusLabelHindi: string;
  statusBadgeColor: string;
  averageSpeedKmH: number;
  delayMins: number;
  congestionPercent: number;
  totalDistanceKm: number;
  currentDurationMins: number;
  freeFlowDurationMins: number;
  recommendation: string;
  freightNotice?: string;
  bottlenecks: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    severity: TrafficSeverity;
    delayMins: number;
    description: string;
  }[];
  segments: TrafficSegment[];
  alternativeRoutes: AlternativeRouteOption[];
  lastUpdated: string;
}

export interface PaymentGatewayConfig {
  activeGateway: 'upi_direct' | 'razorpay' | 'cashfree' | 'all';
  environment: 'sandbox' | 'production';
  merchantUpiId: string;
  merchantName: string;
  merchantPhone: string;
  merchantEmail: string;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  cashfreeAppId?: string;
  cashfreeSecretKey?: string;
  platformCommissionPercent: number;
  isLaunchOfferActive: boolean;
  bankAccount: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  };
  payoutSchedule: 'instant' | 'daily_midnight' | 'weekly';
}

export interface PaymentTransactionRecord {
  id: string;
  orderId: string;
  bookingRef: string;
  amount: number;
  currency: string;
  paymentMethod: 'upi_intent' | 'upi_qr' | 'razorpay' | 'card' | 'netbanking' | 'cash';
  status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  driverShareAmount: number;
  platformFeeAmount: number;
  timestamp: string;
  receiptNumber: string;
  gstin?: string;
  hsnSacCode: string;
}

