import axiosInstance from './apiBase';

export default {
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
  }
};