import { ApiResponse, ContentListResponse } from '../types/api';
import { Medal } from '../types/medal';
import { apiGet, apiPut, apiPost } from './apiHelpers';

export interface UpdateMedalRequest {
  name: string;
  introduction: string;
  activationIconUrl: string;
  disableIconUrl: string;
  acquisitionDescription?: string;
}

export interface AssignMedalResponse {
  ok: boolean;
  message?: string;
}

export default {
  /**
   * 메달 목록 조회
   */
  getMedals: async (): Promise<ApiResponse<ContentListResponse<Medal>>> => {
    return apiGet<ContentListResponse<Medal>>('/v1/medals');
  },

  /**
   * 메달 수정
   * @param {number} medalId - 메달 ID
   * @param {UpdateMedalRequest} data - 수정할 메달 정보
   * @returns {Promise<ApiResponse<Medal>>} 수정 결과
   */
  updateMedal: async (
    medalId: number,
    data: UpdateMedalRequest
  ): Promise<ApiResponse<Medal>> => {
    return apiPut<Medal>(`/v1/medal/${medalId}`, data);
  },

  /**
   * 유저들에게 메달 지급
   * @param {number} medalId - 메달 ID
   * @param {number[]} userIds - 유저 ID 배열
   * @returns {Promise<ApiResponse<AssignMedalResponse>>} 지급 결과
   */
  assignMedalToUsers: async (
    medalId: number,
    userIds: number[]
  ): Promise<ApiResponse<AssignMedalResponse>> => {
    return apiPost<AssignMedalResponse>(`/v1/users/medal/${medalId}`, {
      userIds: userIds.map(String)
    });
  },
};
