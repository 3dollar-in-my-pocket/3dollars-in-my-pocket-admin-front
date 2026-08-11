import {apiGet, apiPatch, apiPost} from './apiHelpers';
import {ApiResponse} from '@/types/api';
import {
  CreateStoreCategoryRequest,
  StoreCategory,
  StoreCategoryResponse,
  UpdateStoreCategoryRequest
} from '@/types/storeCategory';

export default {
  /**
   * 전체 가게 카테고리 목록 조회
   * @returns {Promise<ApiResponse<StoreCategoryResponse>>} 가게 카테고리 목록
   */
  getAllStoreCategories: async (): Promise<ApiResponse<StoreCategoryResponse>> => {
    return apiGet<StoreCategoryResponse>('/v1/store-categories');
  },

  createStoreCategory: async (data: CreateStoreCategoryRequest): Promise<ApiResponse<StoreCategory>> => {
    return apiPost<StoreCategory>('/v1/store-categories', data);
  },

  updateStoreCategory: async (
    categoryType: string,
    data: UpdateStoreCategoryRequest
  ): Promise<ApiResponse<StoreCategory>> => {
    return apiPatch<StoreCategory>(`/v1/store-categories/${encodeURIComponent(categoryType)}`, data);
  },
};
