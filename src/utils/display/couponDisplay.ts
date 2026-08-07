/**
 * 쿠폰 상태 표시 로직 (라벨, 배지 클래스, 아이콘)
 *
 * 타입과 상수 정의는 types/coupon.ts에 있습니다.
 */

import {COUPON_STATUS, CouponStatus} from '@/types/coupon';

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
