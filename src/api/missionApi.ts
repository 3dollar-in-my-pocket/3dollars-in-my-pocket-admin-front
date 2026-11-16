import {apiGet, apiGetPaginated, apiPost, apiPut} from './apiHelpers';
import {ApiResponse, ContentListResponse, PaginatedResponse} from '@/types/api';
import {
  CreateMissionGroupRequest,
  CreateMissionRequest,
  Mission,
  MissionCompletion,
  MissionGroup,
  UpdateMissionGroupRequest,
  UpdateMissionRequest,
} from '@/types/mission';

const groupPath = (groupCode: string) => `/v1/mission-groups/${encodeURIComponent(groupCode)}`;

/**
 * 미션 관리 API
 *
 * 미션은 반드시 하나의 미션 그룹에 속하며 그룹 code 하위 경로로 다룹니다. 그룹 이동은 불가합니다.
 * 삭제 API는 없습니다. 미션을 내리려면 isVisible=false로 수정합니다.
 */
const missionApi = {
  /** 미션 그룹 목록 조회 (유효 기간 무관 전체, 최신 등록 순, 페이징 없음) */
  getMissionGroups: async (): Promise<ApiResponse<ContentListResponse<MissionGroup>>> => {
    return apiGet<ContentListResponse<MissionGroup>>('/v1/mission-groups');
  },

  /** 미션 그룹 단건 조회 */
  getMissionGroup: async (groupCode: string): Promise<ApiResponse<MissionGroup>> => {
    return apiGet<MissionGroup>(groupPath(groupCode));
  },

  /** 미션 그룹 등록 */
  createMissionGroup: async (data: CreateMissionGroupRequest): Promise<ApiResponse<MissionGroup>> => {
    return apiPost<MissionGroup>('/v1/mission-groups', data);
  },

  /** 미션 그룹 수정 (이름·유효 기간 전체 교체, code 변경 불가) */
  updateMissionGroup: async (
    groupCode: string,
    data: UpdateMissionGroupRequest
  ): Promise<ApiResponse<MissionGroup>> => {
    return apiPut<MissionGroup>(groupPath(groupCode), data);
  },

  /** 그룹의 미션 목록 조회 (비노출 포함, displayOrder 오름차순, 페이징 없음) */
  getMissions: async (groupCode: string): Promise<ApiResponse<ContentListResponse<Mission>>> => {
    return apiGet<ContentListResponse<Mission>>(`${groupPath(groupCode)}/missions`);
  },

  /** 미션 단건 조회. 다른 그룹의 미션이면 404 not_exists_mission */
  getMission: async (groupCode: string, missionId: string): Promise<ApiResponse<Mission>> => {
    return apiGet<Mission>(`${groupPath(groupCode)}/missions/${missionId}`);
  },

  /** 미션 등록 */
  createMission: async (groupCode: string, data: CreateMissionRequest): Promise<ApiResponse<Mission>> => {
    return apiPost<Mission>(`${groupPath(groupCode)}/missions`, data);
  },

  /** 미션 수정 (전체 교체 — 변경하지 않는 필드도 현재 값을 그대로 보내야 합니다) */
  updateMission: async (
    groupCode: string,
    missionId: string,
    data: UpdateMissionRequest
  ): Promise<ApiResponse<Mission>> => {
    return apiPut<Mission>(`${groupPath(groupCode)}/missions/${missionId}`, data);
  },

  /** 유저 미션 완료 이력 조회 (최신순, size 1~30) */
  getUserMissionCompletions: async (
    userId: string,
    cursor: string | null = null,
    size?: number
  ): Promise<ApiResponse<PaginatedResponse<MissionCompletion>>> => {
    return apiGetPaginated<MissionCompletion>(`/v1/user/${userId}/mission-completions`, {cursor, size});
  },
};

export default missionApi;
