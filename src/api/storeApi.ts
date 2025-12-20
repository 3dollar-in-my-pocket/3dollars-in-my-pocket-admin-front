import axiosInstance from './apiBase';
import {StoreType} from '../types/store';

export default {
  /**
   * 가게 검색
   */
  searchStores: async (
    keyword: string,
    cursor: string | null = null,
    size = 30,
    targetStores: StoreType[] | null = null
  ): Promise<any> => {
    try {
      const params: any = {
        keyword,
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      if (targetStores && targetStores.length > 0) {
        params.targetStores = targetStores.join(',');
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/search/stores',
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
   * 가게 목록 조회 (최신순)
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @param {Array<string>} [targetStores] - 필터링할 가게 타입 (USER_STORE, BOSS_STORE)
   * @returns {Promise<Object>} 가게 목록
   */
  getStores: async (
    cursor: string | null = null,
    size = 30,
    targetStores: StoreType[] | null = null
  ): Promise<any> => {
    try {
      const params: any = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      if (targetStores && targetStores.length > 0) {
        params.targetStores = targetStores.join(',');
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/stores',
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
   * 가게 상세 정보 조회
   * @param {string} storeId - 가게 ID
   * @returns {Promise<Object>} 가게 상세 정보
   */
  getStoreDetail: async (storeId: string): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}`
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
   * 가게 삭제
   * @param {string} storeId - 삭제할 가게 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  deleteStore: async (storeId: string): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/v1/store/${storeId}`
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 사용자가 제보한 가게 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 제보한 가게 목록
   */
  getUserStores: async (userId: string, cursor: string | null = null, size = 20): Promise<any> => {
    try {
      const params: any = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}/stores`,
        params
      });

      if (response.data.ok) {
        const cursor = response.data.data?.cursor || {};
        return {
          ok: response.data.ok,
          data: {
            contents: response.data.data?.contents || [],
            cursor: {
              hasMore: cursor.hasMore || false,
              totalCount: cursor.totalCount || 0,
              nextCursor: cursor.nextCursor || null
            }
          }
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 가게 소식 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [limit=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 소식 목록
   */
  getStorePosts: async (storeId: string, cursor: string | null = null, limit = 20): Promise<any> => {
    try {
      const params: any = {
        limit
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/posts`,
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
   * 가게 메시지 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [limit=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 메시지 목록
   */
  getStoreMessages: async (storeId: string, cursor: string | null = null, limit = 20): Promise<any> => {
    try {
      const params: any = {
        limit
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/messages`,
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
   * 가게 설정 정보 조회
   * @param {string} storeId - 가게 ID
   * @returns {Promise<Object>} 가게 설정 정보
   */
  getStorePreference: async (storeId: string): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/preference`
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
   * 가게 쿠폰 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 쿠폰 목록
   */
  getStoreCoupons: async (storeId: string, cursor: string | null = null, size = 20): Promise<any> => {
    try {
      const params: any = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/coupons`,
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
   * 가게 변경 이력 조회 (기여자 목록)
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 변경 이력 목록
   */
  getStoreChangeHistories: async (storeId: string, cursor: string | null = null, size = 20): Promise<any> => {
    try {
      const params: any = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/change-histories`,
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
};
