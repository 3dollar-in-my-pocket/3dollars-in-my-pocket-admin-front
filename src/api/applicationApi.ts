import {apiGet} from './apiHelpers';
import {ContentListResponse} from '@/types/api';

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
    // apiGet은 실패를 예외로 던지지 않고 {ok: false, data: null}로 반환하므로
    // ok를 확인해야 data가 null인 채로 ok: true가 되는 것을 막을 수 있습니다.
    const response = await apiGet<ContentListResponse<AppScheme>>(
      `/v1/application/${applicationType}/schemes`
    );

    if (!response.ok || !response.data) {
      return {ok: false, data: {contents: []}};
    }

    return {ok: true, data: response.data};
  }
};

export default applicationApi;
