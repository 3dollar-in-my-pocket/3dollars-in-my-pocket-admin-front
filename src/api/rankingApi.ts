import axiosInstance from './apiBase';

export type RankingCriteria = 'MOST_REVIEWS' | 'MOST_VISITS';

export interface District {
  district: string;
  description: string;
}

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
   * @returns {Promise<Object>} 동네 인기 가게 목록
   */
  getPopularNeighborhoodStores: async (
    criteria: RankingCriteria,
    district: string,
    cursor: string | null = null,
    size = 20
  ): Promise<any> => {
    try {
      const params: any = {
        criteria,
        district,
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/ranking/popular-neighborhood/stores',
        params
      });

      if (response.data.ok) {
        return {
          ok: response.data.ok,
          data: response.data.data
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 지역 목록 조회
   * @param {boolean} [includeAll=true] - 전체 옵션 포함 여부
   * @returns {Promise<Object>} 지역 목록 (도/시 및 구/군)
   */
  getProvinces: async (includeAll = true): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/ranking/popular-neighborhood/provinces',
        params: { includeAll }
      });

      if (response.data.ok) {
        return {
          ok: response.data.ok,
          data: response.data.data
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error: any) {
      return error.response;
    }
  }
};
