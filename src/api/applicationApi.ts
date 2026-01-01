import axiosInstance from './apiBase';

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
   */
  getSchemes: async (applicationType: string = 'USER_API'): Promise<AppSchemesResponse> => {
    try {
      const response = await axiosInstance.get(`/v1/application/${applicationType}/schemes`);

      if (response.data.ok) {
        return {
          ok: true,
          data: response.data.data
        };
      } else {
        return {
          ok: false,
          data: {contents: []}
        };
      }
    } catch (error: any) {
      console.error('스킴 목록 조회 실패:', error);
      return {
        ok: false,
        data: {contents: []}
      };
    }
  }
};

export default applicationApi;
