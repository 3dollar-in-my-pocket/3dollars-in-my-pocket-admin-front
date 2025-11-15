import axiosInstance from './apiBase';

export default {
  /**
   * 전체 가게 쿠폰 목록 조회
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @param {string[]} [statuses] - 필터링할 쿠폰 상태 목록 (예: ['ACTIVE', 'STOPPED', 'ENDED'])
   * @returns {Promise<Object>} 쿠폰 목록
   */
  getAllStoreCoupons: async (cursor: string | null = null, size = 20, statuses?: string[]): Promise<any> => {
    try {
      const params: any = {
        includes: 'STORE',
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      if (statuses && statuses.length > 0) {
        params.statuses = statuses.join(',');
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/store-coupons',
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
