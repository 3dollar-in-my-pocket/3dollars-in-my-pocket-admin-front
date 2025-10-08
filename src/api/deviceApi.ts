import axiosInstance from './apiBase';

export default {
  /**
   * 사용자 디바이스 목록 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 디바이스 목록
   */
  getUserDevices: async (userId: any) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}/devices`
      });

      if (response.data.ok) {
        const devices = response.data.data.contents?.map((device: any) => ({
          deviceId: device.deviceId,
          os: device.osPlatform === 'AOS' ? 'Android' : device.osPlatform,
          appVersion: device.appVersion,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt,
        })) || [];

        return {
          ok: response.data.ok,
          data: devices
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 디바이스 삭제
   * @param {string} deviceId - 삭제할 디바이스 ID
   * @returns {Promise<Object>} 삭제 결과
   */
  deleteDevice: async (deviceId: any) => {
    try {
      const response = await axiosInstance({
        method: 'DELETE',
        url: `/v1/device/${deviceId}`
      });
      return response;
    } catch (error: any) {
      return error.response;
    }
  },
};
