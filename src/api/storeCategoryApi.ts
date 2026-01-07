import { apiGet } from './apiHelpers';
import { ApiResponse } from '../types/api';
import { StoreCategoryResponse } from '../types/storeCategory';

export default {
  /**
   * 전체 가게 카테고리 목록 조회
   * @returns {Promise<ApiResponse<StoreCategoryResponse>>} 가게 카테고리 목록
   */
  getAllStoreCategories: async (): Promise<ApiResponse<StoreCategoryResponse>> => {
    return apiGet<StoreCategoryResponse>('/v1/store-categories');
  },
};
