import { ApiResponse, PaginatedResponse } from '../types/api';
import { StoreImage, UserStoreImage } from '../types/storeImage';
import { apiGetPaginated, apiDelete } from './apiHelpers';
import { INCLUDES } from '../constants/api';

export default {
  /**
   * 전체 가게 이미지 목록 조회 (관리자용)
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<StoreImage>>>} 가게 이미지 목록
   */
  getAllStoreImages: async (
    cursor: string | null = null,
    size: number = 20
  ): Promise<ApiResponse<PaginatedResponse<StoreImage>>> => {
    const params: Record<string, any> = {
      size
    };

    if (cursor) {
      params.cursor = cursor;
    }

    return apiGetPaginated<StoreImage>('/v1/store-images', params, { includes: 'STORE,WRITER'});
  },

  /**
   * 가게 이미지 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<StoreImage>>>} 가게 이미지 목록
   */
  getStoreImages: async (
    storeId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<StoreImage>>> => {
    return apiGetPaginated<StoreImage>(
      `/v1/store/${storeId}/images`,
      { cursor, size },
      { includes: INCLUDES.WRITER }
    );
  },

  /**
   * 가게 이미지 삭제
   * @param {string} imageId - 삭제할 이미지 ID
   * @returns {Promise<any>} 삭제 결과
   */
  deleteStoreImage: async (imageId: string): Promise<any> => {
    return apiDelete(`/v1/store-image/${imageId}`);
  },

  /**
   * 사용자가 등록한 가게 이미지 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<UserStoreImage>>>} 사용자 가게 이미지 이력
   */
  getUserStoreImages: async (
    userId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<UserStoreImage>>> => {
    return apiGetPaginated<UserStoreImage>(
      `/v1/user/${userId}/store-images`,
      { cursor, size },
      { includes: INCLUDES.STORE }
    );
  },
};
