// Coupon related type definitions and constants

import { SimpleStore } from './store';

// Coupon status types
export const COUPON_STATUS = {
  ACTIVE: 'ACTIVE',
  STOPPED: 'STOPPED',
  ENDED: 'ENDED'
} as const;

export type CouponStatus = typeof COUPON_STATUS[keyof typeof COUPON_STATUS];

// Coupon interfaces
export interface ValidityPeriod {
  startDateTime: string;
  endDateTime: string;
}

export interface Coupon {
  couponId: string;
  name: string;
  maxIssuableCount: number;
  currentIssuedCount: number;
  currentUsedCount: number;
  validityPeriod: ValidityPeriod;
  status: CouponStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreCoupon extends Coupon {
  store?: SimpleStore;
}
