import { ApiResponse, PaginatedResponse } from '../types/api';
import { StoreCoupon } from '../types/coupon';
import { INCLUDES } from '../constants/api';
import { buildArrayParam } from '../utils/apiUtils';
import { apiGetPaginated } from './apiHelpers';

export default {
  /**
   * 전체 가게 쿠폰 목록 조회
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @param {string[]} [statuses] - 필터링할 쿠폰 상태 목록 (예: ['ACTIVE', 'STOPPED', 'ENDED'])
   * @returns {Promise<ApiResponse<PaginatedResponse<StoreCoupon>>>} 쿠폰 목록
   */
  getAllStoreCoupons: async (
    cursor: string | null = null,
    size?: number,
    statuses?: string[]
  ): Promise<ApiResponse<PaginatedResponse<StoreCoupon>>> => {
    const additionalParams: Record<string, any> = {
      includes: INCLUDES.STORE,
    };

    const statusesParam = buildArrayParam(statuses);
    if (statusesParam) {
      additionalParams.statuses = statusesParam;
    }

    return apiGetPaginated<StoreCoupon>(
      '/v1/store-coupons',
      { cursor, size },
      additionalParams
    );
  },
};
