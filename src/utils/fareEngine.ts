/**
 * सवारी सेतु (Savari Setu) - मास्टर किराया और संचालन नीति (Master Fare Engine)
 *
 * 1. सामान्य नियम और कमीशन नीति:
 *    - शुरुआती 6 महीने कंपनी का मार्जिन 0% (राइड का 100% पैसा ड्राइवर को)।
 *    - 6 महीने बाद कुल किराए में से 15% कंपनी डिडक्शन और 85% ड्राइवर को।
 *    - टोल टैक्स (Toll Tax): कुल किराए के अंदर शामिल (Include), ग्राहक से कोई अलग टैक्स नहीं।
 *    - सर्ज चार्ज: बारिश/खराब मौसम होने पर सीधे +₹200 अतिरिक्त, नाइट आवर्स में सीधे +₹200 अतिरिक्त।
 *
 * 2. मोटरसाइकिल (Bike Taxi) - केवल डायरेक्ट बुकिंग:
 *    - अधिकतम दूरी: 40 किमी
 *    - 0-2 किमी: फिक्स ₹50 बेस फेयर
 *    - >2 किमी: ₹10 प्रति किमी
 *
 * 3. बैटरी ई-रिक्शा (Battery E-Rickshaw) - शेयर और डायरेक्ट दोनों:
 *    - अधिकतम दूरी: 20 किमी
 *    - शेयरिंग मोड (4-5 किमी तक): ₹20 प्रति सवारी फिक्स
 *    - डायरेक्ट मोड (Full Book): बेस फेयर ₹25 + ₹10 प्रति किमी
 *
 * 4. ऑटो रिक्शा (Auto Rickshaw) - केवल डायरेक्ट बुकिंग:
 *    - अधिकतम दूरी: कोई पाबंदी नहीं
 *    - बेस फेयर: ₹30, प्रति किमी: ₹13, न्यूनतम किराया: ₹45
 *
 * 5. कार सेवाएं:
 *    A. 4 व 5 सीटर कारें (Mini & Sedan) - केवल डायरेक्ट:
 *       - बेस फेयर (0-5 किमी): फिक्स ₹200 (टोल शामिल)
 *       - 5.1-50 किमी: ₹40/किमी
 *       - 50.1-100 किमी: ₹35/किमी
 *       - 100+ किमी: ₹30/किमी
 *    B. 6 व 7 सीटर कारें (SUV / MUV) - केवल डायरेक्ट:
 *       - बेस फेयर (0-5 किमी): फिक्स ₹200 (टोल शामिल)
 *       - 5.1-50 किमी: ₹40/किमी
 *       - 50+ किमी: ₹35/किमी
 */

import { RideMode } from '../types';

export interface MasterFareResult {
  mode: RideMode;
  modeTitle: string;
  subTitle: string;
  bookingType: 'direct' | 'share';
  distanceKm: number;
  baseFare: number;
  distanceFare: number;
  weatherSurge: number;
  nightSurge: number;
  subTotal: number;
  totalFare: number;
  tollTaxIncluded: boolean;
  tollTaxAmount: number; // 0 separate charge
  maxDistanceKm: number | null;
  isDistanceAllowed: boolean;
  distanceWarning?: string;
  slabBreakdown: {
    label: string;
    km: number;
    ratePerKm: number;
    amount: number;
  }[];
  // Commission policy
  isInitial6Months: boolean;
  commissionPercent: number; // 0% or 15%
  driverShare: number;       // 100% or 85%
  companyDeduction: number;  // 0% or 15%
  explanationText: string;
  isReturnTripDiscount: boolean;
  returnTripDiscountAmount: number;
  isOutstation: boolean;
  outstationType?: 'one_way' | 'round_trip';
}

export interface MasterFareOptions {
  distanceKm: number;
  mode: RideMode;
  hasBadWeather?: boolean;
  isNightHours?: boolean;
  isInitial6Months?: boolean; // default true
  passengerCount?: number;   // for sharing mode
  isReturnTripDiscount?: boolean;
  isOutstation?: boolean;
  outstationType?: 'one_way' | 'round_trip';
}

/**
 * Checks if current time falls within standard Night Hours (10:00 PM to 06:00 AM)
 */
export function isCurrentlyNightHours(): boolean {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 6;
}

/**
 * Calculate Master Fare strictly following Savari Setu Policy
 */
export function calculateMasterFare(options: MasterFareOptions): MasterFareResult {
  const {
    distanceKm: rawDistance,
    mode,
    hasBadWeather = false,
    isNightHours = false,
    isInitial6Months = true,
  } = options;

  const distanceKm = Math.max(0.5, Math.round(rawDistance * 10) / 10);
  const weatherSurge = hasBadWeather ? 200 : 0;
  const nightSurge = isNightHours ? 200 : 0;

  let modeTitle = '';
  let subTitle = '';
  let bookingType: 'direct' | 'share' = 'direct';
  let baseFare = 0;
  let distanceFare = 0;
  let maxDistanceKm: number | null = null;
  let isDistanceAllowed = true;
  let distanceWarning: string | undefined;
  const slabBreakdown: { label: string; km: number; ratePerKm: number; amount: number }[] = [];

  switch (mode) {
    // वॉकर बुकिंग (Walker Booking / Runner & Porter) - अधिकतम 5 किमी
    case 'walker': {
      modeTitle = 'वॉकर रनर (Walker Booking)';
      subTitle = 'पैदल डिलीवरी व कुली • 0-1 किमी ₹25 बेस • फिर ₹12/किमी';
      bookingType = 'direct';
      maxDistanceKm = 5;

      if (distanceKm > 5) {
        isDistanceAllowed = false;
        distanceWarning = 'पैदल वॉकर सेवा अधिकतम 5 किलोमीटर तक ही उपलब्ध है। अधिक दूरी हेतु कृपया बाइक या ऑटो चुनें।';
      }

      baseFare = 25; // 0 से 1 किमी बेस चार्ज
      if (distanceKm <= 1) {
        distanceFare = 0;
        slabBreakdown.push({
          label: '0 से 1 किमी (बेस फेयर)',
          km: distanceKm,
          ratePerKm: 0,
          amount: 25,
        });
      } else {
        const extraKm = Math.round((distanceKm - 1) * 10) / 10;
        distanceFare = Math.round(extraKm * 12);
        slabBreakdown.push({
          label: '0 से 1 किमी (बेस फेयर)',
          km: 1,
          ratePerKm: 0,
          amount: 25,
        });
        slabBreakdown.push({
          label: '1 किमी के बाद (@ ₹12/किमी)',
          km: extraKm,
          ratePerKm: 12,
          amount: distanceFare,
        });
      }
      break;
    }

    // 2. मोटरसाइकिल (Bike Taxi) - केवल डायरेक्ट बुकिंग (अधिकतम 40 किमी)
    case 'bike': {
      modeTitle = 'मोटरसाइकिल (Bike Taxi)';
      subTitle = 'केवल डायरेक्ट बुकिंग • अधिकतम 40 किमी';
      bookingType = 'direct';
      maxDistanceKm = 40;

      if (distanceKm > 40) {
        isDistanceAllowed = false;
        distanceWarning = 'बाइक टैक्सी केवल अधिकतम 40 किलोमीटर तक मान्य है। कृपया ऑटो या कार चुनें।';
      }

      baseFare = 50; // 0 से 2 किमी: फिक्स ₹50
      if (distanceKm <= 2) {
        distanceFare = 0;
        slabBreakdown.push({
          label: '0 से 2 किमी (बेस फेयर)',
          km: distanceKm,
          ratePerKm: 0,
          amount: 50,
        });
      } else {
        const extraKm = Math.round((distanceKm - 2) * 10) / 10;
        distanceFare = Math.round(extraKm * 10);
        slabBreakdown.push({
          label: '0 से 2 किमी (बेस फेयर)',
          km: 2,
          ratePerKm: 0,
          amount: 50,
        });
        slabBreakdown.push({
          label: '2 किमी के बाद',
          km: extraKm,
          ratePerKm: 10,
          amount: distanceFare,
        });
      }
      break;
    }

    // 3. बैटरी ई-रिक्शा (Battery E-Rickshaw) - शेयरिंग मोड (अधिकतम 20 किमी)
    case 'erickshaw_share':
    case 'share': {
      modeTitle = 'ई-रिक्शा शेयरिंग (E-Rickshaw Share)';
      subTitle = 'शेयर मोड (4-5 किमी) • ₹20 प्रति सवारी फिक्स';
      bookingType = 'share';
      maxDistanceKm = 20;

      if (distanceKm > 20) {
        isDistanceAllowed = false;
        distanceWarning = 'ई-रिक्शा सेवा केवल अधिकतम 20 किलोमीटर तक उपलब्ध है।';
      }

      // शेयरिंग मोड (4-5 किमी तक): ₹20 प्रति सवारी (फिक्स)
      baseFare = 20;
      distanceFare = 0;
      slabBreakdown.push({
        label: 'शेयरिंग मोड (प्रति सीट फिक्स किराया)',
        km: distanceKm,
        ratePerKm: 0,
        amount: 20,
      });
      break;
    }

    // 3. बैटरी ई-रिक्शा (Battery E-Rickshaw) - डायरेक्ट मोड (अधिकतम 20 किमी)
    case 'erickshaw_direct':
    case 'erickshaw': {
      modeTitle = 'ई-रिक्शा डायरेक्ट (Full Book)';
      subTitle = 'पूरी गाड़ी डायरेक्ट • अधिकतम 20 किमी';
      bookingType = 'direct';
      maxDistanceKm = 20;

      if (distanceKm > 20) {
        isDistanceAllowed = false;
        distanceWarning = 'ई-रिक्शा सेवा केवल अधिकतम 20 किलोमीटर तक उपलब्ध है।';
      }

      // डायरेक्ट मोड (Full Book): बेस फेयर ₹25 + लगभग ₹10 प्रति किलोमीटर
      baseFare = 25;
      distanceFare = Math.round(distanceKm * 10);
      slabBreakdown.push({
        label: 'बेस फेयर (आरंभिक चार्ज)',
        km: 0,
        ratePerKm: 0,
        amount: 25,
      });
      slabBreakdown.push({
        label: 'प्रति किमी चार्ज',
        km: distanceKm,
        ratePerKm: 10,
        amount: distanceFare,
      });
      break;
    }

    // 4. ऑटो रिक्शा (Auto Rickshaw) - केवल डायरेक्ट बुकिंग (कोई दूरी पाबंदी नहीं)
    case 'auto':
    case 'direct': {
      modeTitle = 'ऑटो रिक्शा (Auto Rickshaw)';
      subTitle = 'केवल डायरेक्ट बुकिंग • शहर व उपनगर सफर';
      bookingType = 'direct';
      maxDistanceKm = null; // कोई पाबंदी नहीं

      // बेस फेयर: ₹30, ₹13/किमी, न्यूनतम किराया: ₹45
      baseFare = 30;
      const normalKmCost = Math.round(distanceKm * 13);
      const computedTotal = baseFare + normalKmCost;

      if (computedTotal < 45) {
        // Minimum fare guarantee of ₹45
        distanceFare = 15; // 30 + 15 = 45
        slabBreakdown.push({
          label: 'न्यूनतम गारंटी किराया (Minimum Fare)',
          km: distanceKm,
          ratePerKm: 13,
          amount: 45,
        });
      } else {
        distanceFare = normalKmCost;
        slabBreakdown.push({
          label: 'बेस फेयर',
          km: 0,
          ratePerKm: 0,
          amount: 30,
        });
        slabBreakdown.push({
          label: 'दूरी चार्ज (@ ₹13/किमी)',
          km: distanceKm,
          ratePerKm: 13,
          amount: distanceFare,
        });
      }
      break;
    }

    // 5A. 4 सीटर और 5 सीटर कारें (Mini & Sedan) - केवल डायरेक्ट बुकिंग
    case 'car_4_5':
    case 'minicar': {
      modeTitle = '4 व 5 सीटर कार (Mini & Sedan)';
      subTitle = 'केवल डायरेक्ट • बेस ₹200 (टोल टैक्स शामिल)';
      bookingType = 'direct';
      maxDistanceKm = null;

      // बेस फेयर (0 से 5 किमी): फिक्स ₹200 (टोल शामिल)
      baseFare = 200;

      if (distanceKm <= 5) {
        distanceFare = 0;
        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल टैक्स शामिल)',
          km: distanceKm,
          ratePerKm: 0,
          amount: 200,
        });
      } else if (distanceKm <= 50) {
        // 5.1 से 50 किमी की रेंज: ₹40 प्रति किमी
        const extraKm = Math.round((distanceKm - 5) * 10) / 10;
        distanceFare = Math.round(extraKm * 40);
        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल शामिल)',
          km: 5,
          ratePerKm: 0,
          amount: 200,
        });
        slabBreakdown.push({
          label: '5.1 से 50 किमी स्लैब (@ ₹40/किमी)',
          km: extraKm,
          ratePerKm: 40,
          amount: distanceFare,
        });
      } else if (distanceKm <= 100) {
        // 50.1 से 100 किमी की रेंज: ₹35 प्रति किमी
        const slab1Km = 45; // 5 to 50
        const slab1Amt = slab1Km * 40; // 1800
        const extraKm = Math.round((distanceKm - 50) * 10) / 10;
        const slab2Amt = Math.round(extraKm * 35);
        distanceFare = slab1Amt + slab2Amt;

        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल शामिल)',
          km: 5,
          ratePerKm: 0,
          amount: 200,
        });
        slabBreakdown.push({
          label: '5.1 से 50 किमी स्लैब (@ ₹40/किमी)',
          km: 45,
          ratePerKm: 40,
          amount: slab1Amt,
        });
        slabBreakdown.push({
          label: '50.1 से 100 किमी स्लैब (@ ₹35/किमी)',
          km: extraKm,
          ratePerKm: 35,
          amount: slab2Amt,
        });
      } else {
        // 100 किमी से ऊपर (100+ km): ₹30 प्रति किमी
        const slab1Amt = 45 * 40; // 1800 (5 to 50)
        const slab2Amt = 50 * 35; // 1750 (50 to 100)
        const extraKm = Math.round((distanceKm - 100) * 10) / 10;
        const slab3Amt = Math.round(extraKm * 30);
        distanceFare = slab1Amt + slab2Amt + slab3Amt;

        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल शामिल)',
          km: 5,
          ratePerKm: 0,
          amount: 200,
        });
        slabBreakdown.push({
          label: '5.1 से 50 किमी (@ ₹40/किमी)',
          km: 45,
          ratePerKm: 40,
          amount: slab1Amt,
        });
        slabBreakdown.push({
          label: '50.1 से 100 किमी (@ ₹35/किमी)',
          km: 50,
          ratePerKm: 35,
          amount: slab2Amt,
        });
        slabBreakdown.push({
          label: '100+ किमी स्लैब (@ ₹30/किमी)',
          km: extraKm,
          ratePerKm: 30,
          amount: slab3Amt,
        });
      }
      break;
    }

    // 5B. 6 सीटर और 7 सीटर कारें (SUV / MUV) - केवल डायरेक्ट बुकिंग
    case 'car_6_7':
    case 'suv':
    default: {
      modeTitle = '6 व 7 सीटर SUV (SUV / MUV)';
      subTitle = 'केवल डायरेक्ट • बेस ₹200 (टोल टैक्स शामिल)';
      bookingType = 'direct';
      maxDistanceKm = null;

      // बेस फेयर (0 से 5 किमी): फिक्स ₹200 (टोल शामिल)
      baseFare = 200;

      if (distanceKm <= 5) {
        distanceFare = 0;
        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल टैक्स शामिल)',
          km: distanceKm,
          ratePerKm: 0,
          amount: 200,
        });
      } else if (distanceKm <= 50) {
        // 5.1 से 50 किमी की रेंज: ₹40 प्रति किमी
        const extraKm = Math.round((distanceKm - 5) * 10) / 10;
        distanceFare = Math.round(extraKm * 40);
        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल शामिल)',
          km: 5,
          ratePerKm: 0,
          amount: 200,
        });
        slabBreakdown.push({
          label: '5.1 से 50 किमी स्लैब (@ ₹40/किमी)',
          km: extraKm,
          ratePerKm: 40,
          amount: distanceFare,
        });
      } else {
        // 50 किमी से ऊपर (50+ km): ₹35 प्रति किमी
        const slab1Amt = 45 * 40; // 1800
        const extraKm = Math.round((distanceKm - 50) * 10) / 10;
        const slab2Amt = Math.round(extraKm * 35);
        distanceFare = slab1Amt + slab2Amt;

        slabBreakdown.push({
          label: '0 से 5 किमी बेस फेयर (टोल शामिल)',
          km: 5,
          ratePerKm: 0,
          amount: 200,
        });
        slabBreakdown.push({
          label: '5.1 से 50 किमी स्लैब (@ ₹40/किमी)',
          km: 45,
          ratePerKm: 40,
          amount: slab1Amt,
        });
        slabBreakdown.push({
          label: '50+ किमी स्लैब (@ ₹35/किमी)',
          km: extraKm,
          ratePerKm: 35,
          amount: slab2Amt,
        });
      }
      break;
    }
  }

  const isReturnTripDiscount = !!options.isReturnTripDiscount;
  const isOutstation = !!options.isOutstation;
  const outstationType = options.outstationType || (isOutstation ? 'one_way' : undefined);

  let returnTripDiscountAmount = 0;
  if (isReturnTripDiscount && distanceFare > 0) {
    returnTripDiscountAmount = Math.round(distanceFare * 0.40); // 40% discount on empty return leg
    distanceFare = Math.max(0, distanceFare - returnTripDiscountAmount);
    slabBreakdown.push({
      label: '🔄 वापसी ट्रिप बचत (Return-Trip 40% OFF)',
      km: 0,
      ratePerKm: 0,
      amount: -returnTripDiscountAmount,
    });
  }

  const subTotal = baseFare + distanceFare;
  const totalFare = Math.max(20, subTotal + weatherSurge + nightSurge);

  // 1. सामान्य नियम और कमीशन नीति:
  // शुरुआती 6 महीने कंपनी का मार्जिन 0% (राइड का 100% पैसा ड्राइवर को)।
  // 6 महीने बाद कुल किराए में से 15% कंपनी डिडक्शन और 85% ड्राइवर को।
  const commissionPercent = isInitial6Months ? 0 : 15;
  const companyDeduction = isInitial6Months ? 0 : Math.round(totalFare * 0.15);
  const driverShare = isInitial6Months ? totalFare : totalFare - companyDeduction;

  const explanationParts: string[] = [];
  explanationParts.push(`बेस फेयर: ₹${baseFare}`);
  if (distanceFare > 0) explanationParts.push(`दूरी किराया: ₹${distanceFare}`);
  if (returnTripDiscountAmount > 0) explanationParts.push(`वापसी ट्रिप छूट: -₹${returnTripDiscountAmount} (40% बचत)`);
  if (weatherSurge > 0) explanationParts.push(`खराब मौसम सर्ज: +₹${weatherSurge}`);
  if (nightSurge > 0) explanationParts.push(`नाइट आवर्स सर्ज: +₹${nightSurge}`);
  if (isOutstation) explanationParts.push(`आउटस्टेशन: ${outstationType === 'round_trip' ? 'राउंड ट्रिप' : 'वन-वे'}`);
  explanationParts.push(`टोल टैक्स: शामिल (अलग से ₹0)`);

  return {
    mode,
    modeTitle,
    subTitle,
    bookingType,
    distanceKm,
    baseFare,
    distanceFare,
    weatherSurge,
    nightSurge,
    subTotal,
    totalFare,
    tollTaxIncluded: true,
    tollTaxAmount: 0,
    maxDistanceKm,
    isDistanceAllowed,
    distanceWarning,
    slabBreakdown,
    isInitial6Months,
    commissionPercent,
    driverShare,
    companyDeduction,
    explanationText: explanationParts.join(' • '),
    isReturnTripDiscount,
    returnTripDiscountAmount,
    isOutstation,
    outstationType,
  };
}

/**
 * Service options configuration for UI selection
 */
export const MASTER_VEHICLE_CONFIGS: {
  id: RideMode;
  title: string;
  subtext: string;
  badge: string;
  capacity: string;
  maxDistanceText: string;
  bookingType: 'direct' | 'share';
  etaMins: number;
}[] = [
  {
    id: 'walker',
    title: 'पैदल वॉकर (Walker Runner)',
    subtext: '0-1 किमी ₹25 बेस • फिर ₹12/किमी (मैक्स 5 किमी)',
    badge: 'वॉकर डिलीवरी / कुली • 5 km max',
    capacity: '10 kg पार्सल / कुली',
    maxDistanceText: 'अधिकतम 5 किमी',
    bookingType: 'direct',
    etaMins: 5,
  },
  {
    id: 'bike',
    title: 'मोटरसाइकिल (Bike Taxi)',
    subtext: '0-2 किमी ₹50 फिक्स • फिर ₹10/किमी',
    badge: 'केवल डायरेक्ट • 40 km max',
    capacity: '1 सवारी',
    maxDistanceText: 'अधिकतम 40 किमी',
    bookingType: 'direct',
    etaMins: 3,
  },
  {
    id: 'erickshaw_share',
    title: 'ई-रिक्शा शेयर (Share)',
    subtext: '4-5 किमी तक ₹20 प्रति सवारी फिक्स',
    badge: 'शेयरिंग मोड • 20 km max',
    capacity: 'प्रति सीट',
    maxDistanceText: 'अधिकतम 20 किमी',
    bookingType: 'share',
    etaMins: 5,
  },
  {
    id: 'erickshaw_direct',
    title: 'ई-रिक्शा डायरेक्ट (Full)',
    subtext: 'बेस ₹25 + ₹10/किमी डायरेक्ट',
    badge: 'फुल बुक • 20 km max',
    capacity: '4 सवारी',
    maxDistanceText: 'अधिकतम 20 किमी',
    bookingType: 'direct',
    etaMins: 4,
  },
  {
    id: 'auto',
    title: 'ऑटो रिक्शा (Auto)',
    subtext: 'बेस ₹30 + ₹13/किमी (न्यूनतम ₹45)',
    badge: 'केवल डायरेक्ट • कोई सीमा नहीं',
    capacity: '3 सवारी',
    maxDistanceText: 'अनलिमिटेड दूरी',
    bookingType: 'direct',
    etaMins: 4,
  },
  {
    id: 'car_4_5',
    title: '4 व 5 सीटर कार (Mini / Sedan)',
    subtext: 'बेस ₹200 (टोल शामिल) • स्लैब ₹40/₹35/₹30',
    badge: 'केवल डायरेक्ट • टोल शामिल',
    capacity: '4-5 सवारी AC',
    maxDistanceText: 'अनलिमिटेड दूरी',
    bookingType: 'direct',
    etaMins: 5,
  },
  {
    id: 'car_6_7',
    title: '6 व 7 सीटर कार (SUV / MUV)',
    subtext: 'बेस ₹200 (टोल शामिल) • स्लैब ₹40/₹35',
    badge: 'केवल डायरेक्ट • टोल शामिल',
    capacity: '6-7 सवारी AC',
    maxDistanceText: 'अनलिमिटेड दूरी',
    bookingType: 'direct',
    etaMins: 6,
  },
];
