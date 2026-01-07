import { ApiResponse, PaginatedResponse } from '../types/api';
import { Visit, UserVisit } from '../types/visit';
import { apiGetPaginated } from './apiHelpers';
import { INCLUDES } from '../constants/api';

export default {
  /**
   * 가게 방문 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<Visit>>>} 가게 방문 목록
   */
  getStoreVisits: async (
    storeId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<Visit>>> => {
    return apiGetPaginated<Visit>(
      `/v1/store/${storeId}/visits`,
      { cursor, size },
      { includes: INCLUDES.VISITOR }
    );
  },

  /**
   * 사용자의 가게 방문 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<UserVisit>>>} 사용자 방문 이력
   */
  getUserVisits: async (
    userId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<UserVisit>>> => {
    return apiGetPaginated<UserVisit>(
      `/v1/user/${userId}/store-visits`,
      { cursor, size },
      { includes: INCLUDES.STORE }
    );
  },
};
