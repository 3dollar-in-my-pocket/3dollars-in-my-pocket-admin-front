import axiosInstance from './apiBase';

export default {
  /**
   * 디바이스 삭제
   * @param {string} deviceId - 삭제할 디바이스 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  deleteDevice: async (deviceId) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/v1/device/${deviceId}`
      });
      return response;
    } catch (error) {
      return error.response;
    }
  },
};
