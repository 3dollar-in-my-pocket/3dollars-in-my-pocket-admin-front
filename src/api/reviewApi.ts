import { ApiResponse, PaginatedResponse } from '../types/api';
import { Review, UserReview } from '../types/review';
import { apiGetPaginated } from './apiHelpers';
import { INCLUDES } from '../constants/api';
import axiosInstance from './apiBase';

export default {
  /**
   * 가게 리뷰 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<Review>>>} 가게 리뷰 목록
   */
  getStoreReviews: async (
    storeId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    return apiGetPaginated<Review>(
      `/v1/store/${storeId}/reviews`,
      { cursor, size },
      { includes: INCLUDES.WRITER }
    );
  },

  /**
   * 리뷰 블라인드
   * @param {string} reviewId - 삭제할 리뷰 ID
   * @returns {Promise<any>} 삭제 결과
   */
  blindStoreReview: async (reviewId: string): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `/v1/store-review/${reviewId}/blind`
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 사용자가 작성한 리뷰 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<UserReview>>>} 사용자 리뷰 목록
   */
  getUserReviews: async (
    userId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<UserReview>>> => {
    return apiGetPaginated<UserReview>(
      `/v1/user/${userId}/store-reviews`,
      { cursor, size },
      { includes: INCLUDES.STORE }
    );
  },

  /**
   * 전체 스토어 리뷰 목록 조회
   * @param {string | null} [cursor] - 페이징 커서
   * @param {number} [size] - 페이지 사이즈
   * @returns {Promise<ApiResponse<PaginatedResponse<Review>>>} 전체 스토어 리뷰 목록
   */
  getAllStoreReviews: async (
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    return apiGetPaginated<Review>(
      '/v1/store-reviews',
      { cursor, size },
      { includes: 'STORE,WRITER' }
    );
  },
};
