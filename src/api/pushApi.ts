import axiosInstance from './apiBase';
import userApi from './userApi';
import { SEARCH_TYPES } from '../types/user';

const pushApi = {
  /**
   * 푸시 발송
   * @param {string} pushType - 푸시 타입 ('SIMPLE' | 'SIMPLE_MARKETING')
   * @param {Object} pushData - 푸시 데이터
   * @param {Array<string>} pushData.accountIds - 대상 사용자 ID 목록
   * @param {string} pushData.accountType - 계정 타입 (기본값: 'USER_ACCOUNT')
   * @param {string} pushData.title - 푸시 제목
   * @param {string} pushData.body - 푸시 내용
   * @param {string} [pushData.path] - 이동 경로 (선택)
   * @returns {Promise<Object>} 발송 결과
   */
  sendPush: async (pushType: any, pushData: any) => {
    try {
      const response = await axiosInstance({
        method: 'POST',
        url: `/v1/push/${pushType}`,
        data: pushData
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
   * @param {string} nickname - 검색할 닉네임
   * @returns {Promise<Object>} 검색 결과
   */
  searchUserByNickname: async (nickname: any) => {
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