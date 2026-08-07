// Coupon related type definitions and constants

import { SimpleStore } from './domain';

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

/**
 * 하위 호환용 별칭
 *
 * dateUtils의 formatDateTimeShortKo와 동일합니다. 새 코드는 그쪽을 사용하세요.
 */
export {formatDateTimeShortKo as formatCouponDate} from '../utils/dateUtils';

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/couponDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {
  getCouponStatusDisplayName,
  getCouponStatusBadgeClass
} from '../utils/display/couponDisplay';
