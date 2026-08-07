// Coupon related type definitions and constants

import {DateTimeInterval} from './domain';
import {SimpleStore} from './store';

// Coupon status types
export const COUPON_STATUS = {
  ACTIVE: 'ACTIVE',
  STOPPED: 'STOPPED',
  ENDED: 'ENDED'
} as const;

export type CouponStatus = typeof COUPON_STATUS[keyof typeof COUPON_STATUS];

/** StoreCouponResponse */
export interface Coupon {
  couponId: string;
  name: string;
  maxIssuableCount: number;
  currentIssuedCount: number;
  currentUsedCount: number;
  validityPeriod: DateTimeInterval;
  status: CouponStatus;
  store?: SimpleStore;
  createdAt?: string;
  updatedAt?: string;
}
