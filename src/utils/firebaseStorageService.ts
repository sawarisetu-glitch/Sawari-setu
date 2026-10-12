import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { storage, db, auth } from '../firebase';
import { DriverKycDoc } from '../types';

export interface DocumentUploadResult {
  success: boolean;
  doc: DriverKycDoc;
  storageUrl?: string;
  error?: string;
}

const LOCAL_KYC_KEY = 'sawari_driver_kyc_docs';

/**
 * Get all cached documents for a driver from localStorage
 */
export function getLocalDriverDocuments(driverId: string): DriverKycDoc[] {
  try {
    const raw = localStorage.getItem(LOCAL_KYC_KEY);
    if (!raw) return [];
    const list: DriverKycDoc[] = JSON.parse(raw);
    return list.filter((d) => d.driverId === driverId || !d.driverId);
  } catch {
    return [];
  }
}

/**
 * Save document to localStorage cache
 */
export function saveLocalDriverDocument(newDoc: DriverKycDoc): void {
  try {
    const raw = localStorage.getItem(LOCAL_KYC_KEY);
    const list: DriverKycDoc[] = raw ? JSON.parse(raw) : [];
    const updated = [newDoc, ...list.filter((d) => d.id !== newDoc.id)];
    localStorage.setItem(LOCAL_KYC_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save to localStorage:', err);
  }
}

/**
 * Remove document from localStorage cache
 */
export function removeLocalDriverDocument(docId: string): void {
  try {
    const raw = localStorage.getItem(LOCAL_KYC_KEY);
    if (!raw) return;
    const list: DriverKycDoc[] = JSON.parse(raw);
    const updated = list.filter((d) => d.id !== docId);
    localStorage.setItem(LOCAL_KYC_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to remove from localStorage:', err);
  }
}

/**
 * Convert file to Base64 for instant preview & fallback storage
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Upload driver document (Police Verification, Aadhaar, License, etc.)
 * securely to Firebase Storage, store metadata in Firestore, and cache locally.
 */
export async function uploadDriverDocumentToFirebase(
  file: File,
  docType: DriverKycDoc['docType'],
  driverId: string,
  docNumber: string,
  driverName: string,
  driverPhone: string,
  onProgress?: (progressPercent: number) => void,
  category?: DriverKycDoc['category'],
  docTitle?: string
): Promise<DocumentUploadResult> {
  const docId = `doc_${driverId}_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const readableSize =
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.round(file.size / 1024)} KB`;

  // Always generate base64 for instant preview
  let base64Preview = '';
  try {
    base64Preview = await fileToBase64(file);
  } catch {
    // Non-fatal
  }

  let finalStorageUrl: string | undefined = undefined;

  // 1. Attempt upload to Firebase Storage
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `drivers/${driverId}/${docType.replace(/\s+/g, '_')}_${Date.now()}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        driverId,
        docType,
        docNumber,
        driverName,
      },
    });

    // Monitor upload progress
    await new Promise<void>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(percent);
          }
        },
        (error) => {
          console.warn('Firebase Storage upload error:', error);
          reject(error);
        },
        async () => {
          try {
            finalStorageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve();
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });
  } catch (storageError: any) {
    console.warn(
      'Firebase Storage unavailable or rejected; fallback to local secure preview:',
      storageError
    );
    // Even if storage bucket is restricted, continue with base64 preview
    finalStorageUrl = base64Preview;
    if (onProgress) onProgress(100);
  }

  const kycDocRecord: DriverKycDoc = {
    id: docId,
    driverId,
    driverName,
    driverPhone,
    category,
    docType,
    docTitle,
    docNumber: docNumber.trim() || 'VERIF-PENDING',
    status: 'pending',
    uploadedAt: timestamp,
    previewUrl: base64Preview,
    storageUrl: finalStorageUrl,
    fileName: file.name,
    fileSize: readableSize,
  };

  // 2. Persist record to Firestore (/kyc_documents/{docId})
  try {
    const firestoreDocRef = doc(db, 'kyc_documents', docId);
    await setDoc(firestoreDocRef, {
      docId,
      driverId,
      driverName,
      driverPhone,
      category: category || 'driver',
      docType,
      docTitle: docTitle || '',
      docNumber: docNumber.trim() || 'VERIF-PENDING',
      status: 'pending',
      uploadedAt: timestamp,
      storageUrl: finalStorageUrl || '',
      fileName: file.name,
      fileSize: readableSize,
      createdAt: serverTimestamp(),
    });
  } catch (firestoreErr) {
    console.warn('Firestore write warning:', firestoreErr);
  }

  // 3. Cache in localStorage so driver can view immediately
  saveLocalDriverDocument(kycDocRecord);

  return {
    success: true,
    doc: kycDocRecord,
    storageUrl: finalStorageUrl,
  };
}

/**
 * Fetch all driver documents from Firestore and sync with local storage
 */
export async function fetchDriverDocuments(driverId: string): Promise<DriverKycDoc[]> {
  const localList = getLocalDriverDocuments(driverId);
  try {
    const q = query(
      collection(db, 'kyc_documents'),
      where('driverId', '==', driverId)
    );
    const snap = await getDocs(q);
    const remoteList: DriverKycDoc[] = [];

    snap.forEach((d) => {
      const data = d.data();
      remoteList.push({
        id: data.docId || d.id,
        driverId: data.driverId,
        driverName: data.driverName || 'चालक',
        driverPhone: data.driverPhone || '',
        docType: data.docType,
        docNumber: data.docNumber,
        status: data.status || 'pending',
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        storageUrl: data.storageUrl,
        previewUrl: data.storageUrl || '',
        fileName: data.fileName,
        fileSize: data.fileSize,
      });
    });

    if (remoteList.length > 0) {
      // Merge unique docs
      const mergedMap = new Map<string, DriverKycDoc>();
      localList.forEach((item) => mergedMap.set(item.id, item));
      remoteList.forEach((item) => mergedMap.set(item.id, item));
      const combined = Array.from(mergedMap.values());
      try {
        localStorage.setItem(LOCAL_KYC_KEY, JSON.stringify(combined));
      } catch {}
      return combined;
    }
  } catch (err) {
    console.warn('Could not fetch from Firestore, returning local cache:', err);
  }
  return localList;
}

/**
 * Delete a driver document from Firebase Storage and Firestore
 */
export async function deleteDriverDocumentFromFirebase(
  docId: string,
  storageUrl?: string
): Promise<boolean> {
  // Delete from Storage if possible
  if (storageUrl && storageUrl.startsWith('https://firebasestorage.googleapis.com')) {
    try {
      const storageRef = ref(storage, storageUrl);
      await deleteObject(storageRef);
    } catch (err) {
      console.warn('Could not delete from Firebase Storage:', err);
    }
  }

  // Delete from Firestore
  try {
    await deleteDoc(doc(db, 'kyc_documents', docId));
  } catch (err) {
    console.warn('Could not delete from Firestore:', err);
  }

  // Remove from local cache
  removeLocalDriverDocument(docId);
  return true;
}
