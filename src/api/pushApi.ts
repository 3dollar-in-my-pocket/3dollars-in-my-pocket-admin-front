import axiosInstance from './apiBase';
import userApi from './userApi';
import { SEARCH_TYPES } from '../types/user';
import { PushRequest } from '../types/push';

const pushApi = {
  /**
   * 푸시 발송
   */
  sendPush: async (
    pushType: string,
    pushData: Partial<PushRequest> & { accountIds: string[], accountType: string },
    nonce?: string
  ) => {
    try {
      const requestData = {
        ...pushData,
        targetOsPlatforms: pushData.targetOsPlatforms ? new Set(pushData.targetOsPlatforms) : undefined
      };

      const response = await axiosInstance({
        method: 'POST',
        url: `/v1/push/${pushType}`,
        data: requestData,
        headers: nonce ? {
          'X-Nonce-Token': nonce,
        } : {},
      });

      if (response.data.ok) {
        return {
          ok: true,
          data: response.data.data
        };
      } else {
        return {
          ok: false,
          error: response.data.message || "푸시 발송에 실패했습니다."
        };
      }
    } catch (error: any) {
      console.error("푸시 발송 실패:", error);
      return {
        ok: false,
        error: error.response?.data?.message || "푸시 발송 중 오류가 발생했습니다."
      };
    }
  },

  /**
   * 사용자 닉네임 검색 (userApi의 searchUsers 활용)
   */
  searchUserByNickname: async (nickname: string) => {
    try {
      const searchRequest = {
        type: SEARCH_TYPES.NAME,
        query: nickname.trim(),
        size: 20
      };

      const response = await userApi.searchUsers(searchRequest);

      if (response.ok) {
        // userApi 응답을 푸시 발송에 맞는 형태로 변환
        const users = response.data.users.map((user: any) => ({
          id: user.userId,
          nickname: user.nickname,
          socialType: user.socialType,
          createdAt: user.createdAt
        }));

        return {
          ok: true,
          data: users
        };
      } else {
        return {
          ok: false,
          error: "사용자 검색에 실패했습니다.",
          data: []
        };
      }
    } catch (error: any) {
      console.error("사용자 검색 실패:", error);
      return {
        ok: false,
        error: error.response?.data?.message || "사용자 검색 중 오류가 발생했습니다.",
        data: []
      };
    }
  }
};

export default pushApi;
