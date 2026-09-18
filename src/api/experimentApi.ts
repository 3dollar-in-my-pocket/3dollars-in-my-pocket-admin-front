import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from './apiHelpers';
import {ApiResponse, ContentListResponse, PaginatedResponse} from '@/types/api';
import {
  CreateExperimentVariantOverrideRequest,
  ExperimentVariantInfo,
  ExperimentVariantOverride,
  UpdateExperimentVariantOverrideRequest,
} from '@/types/experiment';

const experimentApi = {
  /**
   * 지정 가능한 실험·Variant 목록 조회
   *
   * 등록 폼의 드롭다운 선택지를 채우는 용도입니다.
   * 실험은 수시로 추가·제거되므로 화면에 하드코딩하지 마세요.
   */
  getExperimentVariants: async (): Promise<ApiResponse<ContentListResponse<ExperimentVariantInfo>>> => {
    return apiGet<ContentListResponse<ExperimentVariantInfo>>('/v1/experiment/variants');
  },

  /**
   * 등록된 Variant 강제 지정 목록 조회 (커서 페이지네이션)
   */
  getOverrides: async (
    {experimentKey, cursor, size = 20}: {
      experimentKey?: string;
      cursor?: string | null;
      size?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<ExperimentVariantOverride>>> => {
    return apiGetPaginated<ExperimentVariantOverride>(
      '/v1/experiment/overrides',
      {cursor, size},
      experimentKey ? {experimentKey} : undefined
    );
  },

  /**
   * Variant 강제 지정 등록 (nonce 보호)
   */
  createOverride: async (
    experimentKey: string,
    data: CreateExperimentVariantOverrideRequest,
    nonce?: string
  ): Promise<ApiResponse<ExperimentVariantOverride>> => {
    return apiPost<ExperimentVariantOverride>(
      `/v1/experiment/${experimentKey}/override`,
      data,
      {nonce}
    );
  },

  /**
   * Variant 강제 지정 수정
   *
   * 부분 수정이므로 실제로 변경된 필드만 담아서 호출하세요.
   */
  updateOverride: async (
    overrideId: number,
    data: UpdateExperimentVariantOverrideRequest
  ): Promise<ApiResponse<ExperimentVariantOverride>> => {
    return apiPatch<ExperimentVariantOverride>(`/v1/experiment/override/${overrideId}`, data);
  },

  /**
   * Variant 강제 지정 삭제
   */
  deleteOverride: async (overrideId: number): Promise<ApiResponse<void>> => {
    return apiDelete<void>(`/v1/experiment/override/${overrideId}`);
  },
};

export default experimentApi;
