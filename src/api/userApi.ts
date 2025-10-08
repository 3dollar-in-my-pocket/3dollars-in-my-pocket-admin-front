import axiosInstance from './apiBase';
import { createUserDetailResponse, createUserSearchResponse, createUserSettings, UserSearchRequest } from '../types/user';

export default {
  /**
   * 사용자 검색
   */
  searchUsers: async (searchRequest: UserSearchRequest): Promise<any> => {
    try {
      const params: any = {};


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
    } catch (error: any) {
      return error.response;
    }
  },

  /**
   * 사용자 상세 정보 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 상세 정보
   */
  getUserDetail: async (userId: string): Promise<any> => {
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
          } as any,
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
          } as any : null,
          medals: response.data.data.medals?.map((medal: any) => ({
            medalId: medal.medalId,
            name: medal.name,
            iconUrl: medal.iconUrl,
            disableIconUrl: medal.disableIconUrl,
            introduction: medal.introduction,
            acquisition: medal.acquisition ? {
              description: medal.acquisition.description,
              createdAt: medal.acquisition.createdAt
            } : null
          }) as any) || [],
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
    } catch (error: any) {
      return error.response;
    }
  },
};
