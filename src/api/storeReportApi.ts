import axiosInstance from './apiBase';

export default {
  /**
   * 가게 신고 이력 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 신고 이력
   */
  getStoreReports: async (storeId, cursor = null, size = 20) => {
    try {
      const params: any = {
        size,
        includes: 'REPORTER'
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/reports`,
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
   * 사용자의 가게 신고 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 가게 신고 이력
   */
  getUserStoreReports: async (userId, cursor = null, size = 20) => {
    try {
      const params: any = {
        size,
        includes: 'STORE',
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}/store-reports`,
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
};
