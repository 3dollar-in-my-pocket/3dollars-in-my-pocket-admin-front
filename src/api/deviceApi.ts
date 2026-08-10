import {apiDelete, apiGet} from './apiHelpers';
import {ApiResponse, ContentListResponse} from '@/types/api';
import {Device} from '@/types/device';

export default {
  /**
   * 사용자 디바이스 목록 조회
   * @param {string} userId - 사용자 ID
   * @returns 디바이스 목록
   */
  getUserDevices: async (userId: string | number): Promise<ApiResponse<Device[]>> => {
    const response = await apiGet<ContentListResponse<Device>>(`/v1/user/${userId}/devices`);

    return {
      ok: response.ok,
      data: response.data?.contents || []
    };
  },

  /**
   * 디바이스 삭제
   * @param {string} deviceId - 삭제할 디바이스 ID
   */
  deleteDevice: async (deviceId: string): Promise<ApiResponse<void>> => {
    return apiDelete(`/v1/device/${deviceId}`);
  },
};
