import axiosInstance from './apiBase';

export default {
  /**
   * 가게 검색
   * @param {string} keyword - 검색 키워드
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 검색 결과
   */
  searchStores: async (keyword, cursor = null, size = 20) => {
    try {
      const params = {
        keyword,
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/search/stores',
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
   * 가게 목록 조회 (최신순)
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 목록
   */
  getStores: async (cursor = null, size = 20) => {
    try {
      const params = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/stores',
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
  },

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
   * 가게 이미지 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 이미지 목록
   */
  getStoreImages: async (storeId, cursor = null, size = 20) => {
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
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 가게 신고 이력 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 가게 신고 이력
   */
  getStoreReports: async (storeId, cursor = null, size = 20) => {
    try {
      const params = {
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
    } catch (error) {
      return error.response;
    }
  }
};