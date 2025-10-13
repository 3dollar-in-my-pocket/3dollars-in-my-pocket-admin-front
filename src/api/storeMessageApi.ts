import axiosInstance from './apiBase';

export default {
  /**
   * 전체 스토어 메시지 목록 조회
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 전체 스토어 메시지 목록
   */
  getAllStoreMessages: async (cursor: any = null, size = 20) => {
    try {
      const params: any = {
        size,
        includes: 'STORE'
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/store-messages',
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
