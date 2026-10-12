import { initializeApp } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ----------------------------------------------------
// Firebase App Check Integration
// ----------------------------------------------------
let appCheckInstance: AppCheck | null = null;

export function initFirebaseAppCheck(): AppCheck | null {
  if (typeof window === 'undefined') return null;
  if (appCheckInstance) return appCheckInstance;

  try {
    const isDev = import.meta.env.DEV || window.location.hostname === 'localhost';

    // Support App Check Debug Token in dev or if configured
    const debugToken =
      import.meta.env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN ||
      (firebaseConfig as any).appCheckDebugToken;

    if (debugToken) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
    } else if (isDev) {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    const recaptchaKey =
      import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY ||
      (firebaseConfig as any).recaptchaSiteKey ||
      (firebaseConfig as any).recaptchaEnterpriseSiteKey;

    if (recaptchaKey && recaptchaKey.trim().length > 0) {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey.trim()),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('[Sawari Setu] 🛡️ Firebase App Check initialized with reCAPTCHA provider');
    } else if ((self as any).FIREBASE_APPCHECK_DEBUG_TOKEN) {
      // In dev environment or sandbox when explicit key isn't provided, debug token is active
      console.log('[Sawari Setu] 🛡️ Firebase App Check debug token mode configured');
    }
  } catch (appCheckErr) {
    console.warn('[Sawari Setu] Firebase App Check initialization note:', appCheckErr);
  }

  return appCheckInstance;
}

// ----------------------------------------------------
// Firebase Phone Auth with reCAPTCHA Verifier
// ----------------------------------------------------
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
    firebaseConfirmationResult?: ConfirmationResult;
  }
}

/**
 * Initializes or resets the Firebase reCAPTCHA Verifier on a specified container element
 */
export function initRecaptchaVerifier(
  containerId: string = 'recaptcha-container',
  size: 'invisible' | 'normal' = 'invisible',
  onSolve?: (response: any) => void
): RecaptchaVerifier {
  // Clear any existing verifier instance
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      // ignore clear error
    }
    delete window.recaptchaVerifier;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size,
    callback: (response: any) => {
      console.log('[Sawari Setu] 🤖 reCAPTCHA verified successfully');
      if (onSolve) onSolve(response);
    },
    'expired-callback': () => {
      console.warn('[Sawari Setu] ⚠️ reCAPTCHA expired, user verification required again');
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends OTP using Firebase Phone Authentication with reCAPTCHA protection
 */
export async function sendFirebasePhoneOtp(
  rawPhoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  let cleaned = rawPhoneNumber.trim().replace(/\s+/g, '');
  if (!cleaned.startsWith('+')) {
    if (cleaned.length === 10) {
      cleaned = `+91${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }

  console.log(`[Sawari Setu] 📲 Requesting Firebase Phone Auth OTP for: ${cleaned}`);
  const confirmationResult = await signInWithPhoneNumber(auth, cleaned, verifier);
  window.firebaseConfirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Confirms OTP entered by user using Firebase ConfirmationResult
 */
export async function verifyFirebasePhoneOtp(
  confirmationResult: ConfirmationResult,
  otpCode: string
) {
  return await confirmationResult.confirm(otpCode.trim());
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database initializing.');
    }
    return false;
  }
}

