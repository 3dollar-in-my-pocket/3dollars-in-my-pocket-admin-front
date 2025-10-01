import axiosInstance from './apiBase';

export default {
  /**
   * 가게 검색
   * @param {string} keyword - 검색 키워드
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 검색 결과
   */
  searchStores: async (keyword, cursor = null, size = 30) => {
    try {
      const params = {
        keyword,
        size
      };

      if (cursor) {
        params.cursor = cursor;
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
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 가게 목록 조회 (최신순)
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 목록
   */
  getStores: async (cursor = null, size = 30) => {
    try {
      const params = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
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
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 가게 상세 정보 조회
   * @param {string} storeId - 가게 ID
   * @returns {Promise<Object>} 가게 상세 정보
   */
  getStoreDetail: async (storeId) => {
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
    } catch (error) {
      return error.response;
    }
  },


  /**
   * 가게 삭제
   * @param {string} storeId - 삭제할 가게 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  deleteStore: async (storeId) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/v1/store/${storeId}`
      });
      return response;
    } catch (error) {
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
  getUserStores: async (userId, cursor = null, size = 20) => {
    try {
      const params = {
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
    } catch (error) {
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
  getStorePosts: async (storeId, cursor = null, limit = 20) => {
    try {
      const params = {
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
    } catch (error) {
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
  getStoreMessages: async (storeId, cursor = null, limit = 20) => {
    try {
      const params = {
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
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 가게 설정 정보 조회
   * @param {string} storeId - 가게 ID
   * @returns {Promise<Object>} 가게 설정 정보
   */
  getStorePreference: async (storeId) => {
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
    } catch (error) {
      return error.response;
    }
  },
};
