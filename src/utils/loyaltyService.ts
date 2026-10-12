import { LoyaltyAccount, LoyaltyTransaction } from '../types';

const LOYALTY_STORAGE_KEY = 'sawari_loyalty_account';

const INITIAL_LOYALTY_ACCOUNT: LoyaltyAccount = {
  points: 120, // 120 welcome reward points (₹120 value)
  totalEarned: 120,
  totalRedeemed: 0,
  transactions: [
    {
      id: 'TX_WELCOME_BONUS',
      type: 'earned',
      points: 120,
      reason: 'सवारी सेतु स्वागत रिवॉर्ड (Welcome Reward Bonus)',
      timestamp: '2026-10-01 10:00 AM',
    },
  ],
};

export const getLoyaltyAccount = (): LoyaltyAccount => {
  try {
    const raw = localStorage.getItem(LOYALTY_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  saveLoyaltyAccount(INITIAL_LOYALTY_ACCOUNT);
  return INITIAL_LOYALTY_ACCOUNT;
};

export const saveLoyaltyAccount = (account: LoyaltyAccount): void => {
  try {
    localStorage.setItem(LOYALTY_STORAGE_KEY, JSON.stringify(account));
    window.dispatchEvent(new Event('loyalty-updated'));
    window.dispatchEvent(new Event('storage'));
  } catch {}
};

export const earnLoyaltyPoints = (
  points: number,
  reason: string,
  referenceId?: string
): LoyaltyAccount => {
  const current = getLoyaltyAccount();
  const newTx: LoyaltyTransaction = {
    id: `TX_EARN_${Math.floor(10000 + Math.random() * 90000)}`,
    type: 'earned',
    points,
    reason,
    referenceId,
    timestamp: new Date().toLocaleDateString('hi-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated: LoyaltyAccount = {
    points: current.points + points,
    totalEarned: current.totalEarned + points,
    totalRedeemed: current.totalRedeemed,
    transactions: [newTx, ...current.transactions],
  };

  saveLoyaltyAccount(updated);
  return updated;
};

export const redeemLoyaltyPoints = (
  points: number,
  reason: string,
  referenceId?: string
): { success: boolean; account: LoyaltyAccount } => {
  const current = getLoyaltyAccount();
  if (current.points < points) {
    return { success: false, account: current };
  }

  const newTx: LoyaltyTransaction = {
    id: `TX_RED_${Math.floor(10000 + Math.random() * 90000)}`,
    type: 'redeemed',
    points,
    reason,
    referenceId,
    timestamp: new Date().toLocaleDateString('hi-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  const updated: LoyaltyAccount = {
    points: current.points - points,
    totalEarned: current.totalEarned,
    totalRedeemed: current.totalRedeemed + points,
    transactions: [newTx, ...current.transactions],
  };

  saveLoyaltyAccount(updated);
  return { success: true, account: updated };
};

// 1 point = ₹1 discount. Maximum redeemable is up to 30% of total fare.
export const calculateRedeemableDiscount = (
  grossFare: number,
  availablePoints: number
): { maxPoints: number; discountAmount: number } => {
  // Max 30% of fare can be paid via points
  const maxCapDiscount = Math.floor(grossFare * 0.3);
  const redeemablePoints = Math.min(availablePoints, maxCapDiscount);
  return {
    maxPoints: redeemablePoints,
    discountAmount: redeemablePoints, // 1 point = ₹1 discount
  };
};

export const calculatePointsEarnedFromRide = (totalFare: number): number => {
  // 10% of ride fare as points, minimum 10 points
  return Math.max(10, Math.round(totalFare * 0.1));
};

export const calculatePointsEarnedFromShipment = (totalAmount: number): number => {
  // 5% of freight fare as points, minimum 50 points
  return Math.max(50, Math.round(totalAmount * 0.05));
};
