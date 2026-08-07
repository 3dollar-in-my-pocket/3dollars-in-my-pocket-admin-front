import {apiGet} from './apiHelpers';
import {ContentListResponse} from '../types/api';

/** AppSchemeResponse */
export interface AppScheme {
  path: string;
  description: string;
}

export interface AppSchemesResponse {
  ok: boolean;
  data: {
    contents: AppScheme[];
  };
}

const applicationApi = {
  /**
   * 앱 스킴 목록 조회
   *
   * 딥링크 선택 UI에서 사용하므로, 실패 시에도 빈 목록을 반환해
   * 호출부가 예외를 처리하지 않아도 되도록 합니다.
   */
  getSchemes: async (applicationType: string = 'USER'): Promise<AppSchemesResponse> => {
    try {
      const response = await apiGet<ContentListResponse<AppScheme>>(
        `/v1/application/${applicationType}/schemes`
      );
      return {ok: true, data: response.data};
    } catch (error: any) {
      console.error('스킴 목록 조회 실패:', error);
      return {ok: false, data: {contents: []}};
    }
  }
};

export default applicationApi;
