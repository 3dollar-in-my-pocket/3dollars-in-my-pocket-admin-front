import axiosInstance from './apiBase';

export default {
  /**
   * 가게 이미지 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 이미지 목록
   */
  getStoreImages: async (storeId, cursor = null, size = 20) => {
    try {
      const params: any = {
        size,
        includes: 'WRITER'
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/store/${storeId}/images`,
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
   * 가게 이미지 삭제
   * @param {string} imageId - 삭제할 이미지 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  deleteStoreImage: async (imageId: any) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/v1/store-image/${imageId}`
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 사용자가 등록한 가게 이미지 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 가게 이미지 이력
   */
  getUserStoreImages: async (userId, cursor = null, size = 20) => {
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
        url: `/v1/user/${userId}/store-images`,
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
