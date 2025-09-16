import axiosInstance from './apiBase';
import {
  createUserSearchResponse,
  createUserDetailResponse,
  createUserSettings
} from '../types/user';

export default {
  /**
   * 최신순 사용자 목록 조회
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 목록
   */
  getUsers: async (cursor = null, size = 30) => {
    try {
      const params = { size };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/users',
        params
      });

      // API 응답 구조에 맞게 변환
      if (response.data.ok) {
        const searchResponse = createUserSearchResponse({
          users: response.data.data.contents.map(user => ({
            userId: user.userId,
            nickname: user.name,
            socialType: user.socialType,
            createdAt: user.createdAt
          })) || [],
          hasMore: response.data.data.cursor.hasMore || false,
          nextCursor: response.data.data.cursor.nextCursor || null,
          totalCount: response.data.data.contents.length || 0
        });

        return {
          ok: response.data.ok,
          data: searchResponse
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 사용자 검색
   * @param {Object} searchRequest - 검색 요청 객체
   * @param {string} searchRequest.type - 검색 타입 ('name' | 'userId' | 'recent')
   * @param {string} [searchRequest.query] - 이름 검색 시 검색어
   * @param {Array<string>} [searchRequest.userIds] - 유저 ID 검색 시 ID 목록
   * @param {string} [searchRequest.cursor] - 페이징 커서
   * @param {number} [searchRequest.size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 검색 결과
   */
  searchUsers: async (searchRequest) => {
    try {
      const params = {};


      // 이름으로 검색하는 경우
      if (searchRequest.type === 'name' && searchRequest.query) {
        params.name = searchRequest.query;
      }

      // 유저 ID로 검색하는 경우 (쉼표로 구분된 여러 ID 지원)
      if (searchRequest.type === 'userId' && searchRequest.userIds && searchRequest.userIds.length > 0) {
        params.userIds = searchRequest.userIds.join(',');
      }

      if (searchRequest.cursor) {
        params.cursor = searchRequest.cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: '/v1/search/users',
        params
      });

      // API 응답 구조에 맞게 변환
      if (response.data.ok) {
        const searchResponse = createUserSearchResponse({
          users: response.data.data.contents.map(user => ({
            userId: user.userId,
            nickname: user.name,
            socialType: user.socialType,
            createdAt: user.createdAt
          })) || [],
          hasMore: response.data.data.cursor.hasMore || false,
          nextCursor: response.data.data.cursor.nextCursor || null,
          totalCount: response.data.data.contents.length || 0
        });

        return {
          ok: response.data.ok,
          data: searchResponse
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 사용자 상세 정보 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 상세 정보
   */
  getUserDetail: async (userId) => {
    try {
      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}`
      });

      // API 응답 구조에 맞게 변환
      if (response.data.ok) {
        const detailResponse = createUserDetailResponse({
          user: {
            userId: response.data.data.user.userId,
            nickname: response.data.data.user.name,
            socialType: response.data.data.user.socialType,
            createdAt: response.data.data.user.createdAt
          },
          representativeMedal: response.data.data.representativeMedal ? {
            medalId: response.data.data.representativeMedal.medalId,
            name: response.data.data.representativeMedal.name,
            iconUrl: response.data.data.representativeMedal.iconUrl,
            disableIconUrl: response.data.data.representativeMedal.disableIconUrl,
            introduction: response.data.data.representativeMedal.introduction,
            acquisition: response.data.data.representativeMedal.acquisition ? {
              description: response.data.data.representativeMedal.acquisition.description,
              createdAt: response.data.data.representativeMedal.acquisition.createdAt
            } : null
          } : null,
          medals: response.data.data.medals?.map(medal => ({
            medalId: medal.medalId,
            name: medal.name,
            iconUrl: medal.iconUrl,
            disableIconUrl: medal.disableIconUrl,
            introduction: medal.introduction,
            acquisition: medal.acquisition ? {
              description: medal.acquisition.description,
              createdAt: medal.acquisition.createdAt
            } : null
          })) || [],
          devices: response.data.data.devices.map(device => ({
            deviceId: device.deviceId,
            os: device.osPlatform === 'AOS' ? 'Android' : device.osPlatform, // AOS -> Android 변환
            appVersion: device.appVersion,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt,
          })) || [],
          setting: response.data.data.setting ? createUserSettings({
            enableActivitiesPush: response.data.data.setting.enableActivitiesPush,
            marketingConsent: response.data.data.setting.marketingConsent
          }) : null
        });

        return {
          ok: response.data.ok,
          data: detailResponse
        };
      } else {
        throw new Error('API 응답 오류');
      }
    } catch (error) {
      return error.response;
    }
  },

  /**
   * 사용자가 제보한 가게 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 제보한 가게 목록
   */
  getUserStores: async (userId, cursor = null, size = 20) => {
    try {
      const params = {
        size
      };

      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axiosInstance({
        method: 'GET',
        url: `/v1/user/${userId}/stores`,
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

  /**
   * 사용자의 가게 방문 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 방문 이력
   */
  getUserVisits: async (userId, cursor = null, size = 20) => {
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
        url: `/v1/user/${userId}/store-visits`,
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

  /**
   * 사용자가 등록한 가게 이미지 이력 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   * @returns {Promise<Object>} 사용자 가게 이미지 이력
   */
  getUserStoreImages: async (userId, cursor = null, size = 20) => {
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
    } catch (error) {
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
      const params = {
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
    } catch (error) {
      return error.response;
    }
  }
};
