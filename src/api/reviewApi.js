import axiosInstance from './apiBase';

export default {
  /**
   * 가게 리뷰 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 리뷰 목록
   */
  getStoreReviews: async (storeId, cursor = null, size = 20) => {
    try {
      const params = {
        size,
        includes: 'WRITER'
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/reviews`,
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
   * 리뷰 블라인드
   * @param {string} reviewId - 삭제할 리뷰 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  blindStoreReview: async (reviewId) => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `/v1/store-review/${reviewId}/blind`
      });
      return response;
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 사용자가 작성한 리뷰 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 리뷰 목록
   */
  getUserReviews: async (userId, cursor = null, size = 20) => {
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
        url: `/v1/user/${userId}/store-reviews`,
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
