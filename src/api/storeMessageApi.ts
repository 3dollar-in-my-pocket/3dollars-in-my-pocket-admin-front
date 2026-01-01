import { ApiResponse, PaginatedResponse } from '../types/api';
import { StoreMessage } from '../types/storeMessage';
import { INCLUDES } from '../constants/api';
import { apiGetPaginated } from './apiHelpers';

export default {
  /**
   * 전체 스토어 메시지 목록 조회
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<StoreMessage>>>} 전체 스토어 메시지 목록
   */
  getAllStoreMessages: async (
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<StoreMessage>>> => {
    return apiGetPaginated<StoreMessage>(
      '/v1/store-messages',
      { cursor, size },
      { includes: INCLUDES.STORE }
    );
  },
};
