// Coupon related type definitions and constants

import { DateTimeInterval } from './domain';
import { SimpleStore } from './store';

// Coupon status types
export const COUPON_STATUS = {
  ACTIVE: 'ACTIVE',
  STOPPED: 'STOPPED',
  ENDED: 'ENDED'
} as const;

export type CouponStatus = typeof COUPON_STATUS[keyof typeof COUPON_STATUS];

/** DateTimeIntervalResponse와 동일합니다. */
export type ValidityPeriod = DateTimeInterval;

/** StoreCouponResponse */
export interface Coupon {
  couponId: string;
  name: string;
  maxIssuableCount: number;
  currentIssuedCount: number;
  currentUsedCount: number;
  validityPeriod: ValidityPeriod;
  status: CouponStatus;
  store?: SimpleStore;
  createdAt?: string;
  updatedAt?: string;
}

/** 응답 스키마가 Coupon과 동일합니다. */
export type StoreCoupon = Coupon;
