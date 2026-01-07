import { ApiResponse, PaginatedResponse } from '../types/api';
import { StoreReport, UserStoreReport } from '../types/report';
import { apiGetPaginated } from './apiHelpers';
import { INCLUDES } from '../constants/api';

export default {
  /**
   * 가게 신고 이력 조회
   * @param {string} storeId - 가게 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<StoreReport>>>} 가게 신고 이력
   */
  getStoreReports: async (
    storeId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<StoreReport>>> => {
    return apiGetPaginated<StoreReport>(
      `/v1/store/${storeId}/reports`,
      { cursor, size },
      { includes: INCLUDES.REPORTER }
    );
  },

  /**
   * 사용자의 가게 신고 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<UserStoreReport>>>} 사용자 가게 신고 이력
   */
  getUserStoreReports: async (
    userId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<UserStoreReport>>> => {
    return apiGetPaginated<UserStoreReport>(
      `/v1/user/${userId}/store-reports`,
      { cursor, size },
      { includes: INCLUDES.STORE }
    );
  },
};
