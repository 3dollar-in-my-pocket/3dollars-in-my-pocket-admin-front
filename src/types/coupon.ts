// Coupon related type definitions and constants

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

// Utility functions
export const getCouponStatusDisplayName = (status: CouponStatus): string => {
  switch (status) {
    case COUPON_STATUS.ACTIVE:
      return '발급 중';
    case COUPON_STATUS.STOPPED:
      return '발급 중지 (사용만 가능)';
    case COUPON_STATUS.ENDED:
      return '사용 종료';
    default:
      return '알 수 없음';
  }
};

export const getCouponStatusBadgeClass = (status: CouponStatus): string => {
  switch (status) {
    case COUPON_STATUS.ACTIVE:
      return 'bg-success';
    case COUPON_STATUS.STOPPED:
      return 'bg-warning';
    case COUPON_STATUS.ENDED:
      return 'bg-secondary';
    default:
      return 'bg-secondary';
  }
};

export const formatCouponDate = (dateString: string): string => {
  if (!dateString) return '없음';
  return new Date(dateString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
