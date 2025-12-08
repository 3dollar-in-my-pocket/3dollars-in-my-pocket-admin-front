import axiosInstance from './apiBase';

export default {
  /**
   * 메달 목록 조회
   * @returns {Promise<Object>} 메달 목록
   */
  getMedals: async (): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/medals'
      });

      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 메달 수정
   * @param {string} medalId - 메달 ID
   * @param {Object} data - 수정할 메달 정보
   * @returns {Promise<Object>} 수정 결과
   */
  updateMedal: async (medalId: string, data: { name: string; introduction: string; activationIconUrl: string; disableIconUrl: string; acquisitionDescription?: string }): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'PUT',
        url: `/v1/medal/${medalId}`,
        data
      });

      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 유저들에게 메달 지급
   * @param {number} medalId - 메달 ID
   * @param {number[]} userIds - 유저 ID 배열
   * @returns {Promise<Object>} 지급 결과
   */
  assignMedalToUsers: async (medalId: number, userIds: number[]): Promise<any> => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `/v1/users/medal/${medalId}`,
        data: {
          userIds: userIds.map(String)
        }
      });

      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
};
