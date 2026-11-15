import {apiGet, apiPost, apiPut} from './apiHelpers';
import {ApiResponse, ContentListResponse} from '@/types/api';
import {CreateMissionRequest, Mission, UpdateMissionRequest} from '@/types/mission';

/**
 * 미션 관리 API
 *
 * 삭제 API는 없습니다. 미션을 내리려면 isVisible=false로 수정합니다.
 */
const missionApi = {
  /** 미션 목록 조회 (비노출 포함, displayOrder 오름차순, 페이징 없음) */
  getMissions: async (): Promise<ApiResponse<ContentListResponse<Mission>>> => {
    return apiGet<ContentListResponse<Mission>>('/v1/missions');
  },

  /** 미션 단건 조회 */
  getMission: async (missionId: string): Promise<ApiResponse<Mission>> => {
    return apiGet<Mission>(`/v1/missions/${missionId}`);
  },

  /** 미션 등록 */
  createMission: async (data: CreateMissionRequest): Promise<ApiResponse<Mission>> => {
    return apiPost<Mission>('/v1/missions', data);
  },

  /** 미션 수정 (전체 교체 — 변경하지 않는 필드도 현재 값을 그대로 보내야 합니다) */
  updateMission: async (missionId: string, data: UpdateMissionRequest): Promise<ApiResponse<Mission>> => {
    return apiPut<Mission>(`/v1/missions/${missionId}`, data);
  },
};

export default missionApi;
