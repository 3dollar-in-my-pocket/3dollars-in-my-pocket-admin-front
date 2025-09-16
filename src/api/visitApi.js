import axiosInstance from './apiBase';

export default {
  /**
   * 가게 방문 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 방문 목록
   */
  getStoreVisits: async (storeId, cursor = null, size = 20) => {
    try {
      const params = {
        size,
        includes: 'VISITOR'
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/visits`,
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
   * 사용자의 가게 방문 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 방문 이력
   */
  getUserVisits: async (userId, cursor = null, size = 20) => {
    try {
      const params = {
        size,
        includes: 'STORE',
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}/store-visits`,
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
};
