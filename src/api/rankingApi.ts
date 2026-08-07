import { apiGet, apiGetPaginated } from './apiHelpers';
import { ApiResponse, ContentListResponse, PaginatedResponse } from '../types/api';
import { SimpleStore } from '../types/store';

export type RankingCriteria = 'MOST_REVIEWS' | 'MOST_VISITS';

/** NeighborhoodDistrictResponse */
export interface District {
  district: string;
  description: string;
}

/** NeighborhoodProvinceResponse */
export interface Province {
  province: string;
  description: string;
  districts: District[];
}

export default {
  /**
   * 동네 인기 가게 목록 조회
   * @param {RankingCriteria} criteria - 정렬 기준 (MOST_REVIEWS: 리뷰 많은 순, MOST_VISITS: 이번 주 많이 왔다 갔어요)
   * @param {string} district - 지역 구분
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns 동네 인기 가게 목록
   */
  getPopularNeighborhoodStores: async (
    criteria: RankingCriteria,
    district: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<SimpleStore>>> => {
    return apiGetPaginated<SimpleStore>(
      '/v1/ranking/popular-neighborhood/stores',
      { cursor, size },
      { criteria, district }
    );
  },

  /**
   * 지역 목록 조회
   * @param {boolean} [includeAll=true] - 전체 옵션 포함 여부
   * @returns 지역 목록 (도/시 및 구/군)
   */
  getProvinces: async (includeAll = true): Promise<ApiResponse<ContentListResponse<Province>>> => {
    return apiGet<ContentListResponse<Province>>(
      '/v1/ranking/popular-neighborhood/provinces',
      { includeAll }
    );
  }
};
