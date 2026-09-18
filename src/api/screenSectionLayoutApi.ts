import {apiGet, apiPut} from './apiHelpers';
import {ApiResponse} from '@/types/api';
import {
  ReplaceScreenSectionLayoutsRequest,
  ScreenSectionLayoutListResponse,
  ScreenType
} from '@/types/screenSectionLayout';

export default {
  /**
   * 화면에 등록된 섹션 레이아웃 전체 조회
   *
   * 미노출(isVisible=false) 항목도 목록에 포함됩니다.
   * 아직 한 번도 교체하지 않은 화면은 contents가 빈 배열이며, 이 경우 유저 화면은 기본 레이아웃으로 조립됩니다.
   */
  getSectionLayouts: async (screenType: ScreenType): Promise<ApiResponse<ScreenSectionLayoutListResponse>> => {
    return apiGet<ScreenSectionLayoutListResponse>(
      `/v1/screen/${encodeURIComponent(screenType)}/section-layouts`
    );
  },

  /**
   * 화면의 섹션 레이아웃 전체 교체 (OPERATOR 이상)
   *
   * 부분 수정이 아니라 통째로 교체하는 방식이라, 요청에 없는 섹션은 삭제됩니다.
   * displayOrder는 sections 배열 순서로 서버가 계산하므로 요청에 넣지 않습니다.
   */
  replaceSectionLayouts: async (
    screenType: ScreenType,
    data: ReplaceScreenSectionLayoutsRequest
  ): Promise<ApiResponse<ScreenSectionLayoutListResponse>> => {
    return apiPut<ScreenSectionLayoutListResponse>(
      `/v1/screen/${encodeURIComponent(screenType)}/section-layouts`,
      data
    );
  },
};
