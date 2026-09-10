import {ApiResponse, PagePaginatedResponse} from '@/types/api';
import {Admin, CreateAdminRequest, UpdateAdminRequest} from '@/types/admin';
import {apiGet, apiPatch, apiPost} from './apiHelpers';

export default {
  /**
   * 내 관리자 정보 조회
   *
   * 인증 확인용으로도 사용되며 미로그인 상태의 401은 정상 흐름이므로,
   * 공통 에러 토스트를 끄고 호출부(PrivateRouter)가 직접 처리합니다.
   */
  getMyAdmin: async (): Promise<ApiResponse<Admin>> => {
    return apiGet<Admin>(`/v1/my/admin`, undefined, {suppressToast: true});
  },

  /**
   * 관리자 목록 조회 (페이지 기반)
   */
  getAdmins: async ({size = 10, page = 1}: {
    size?: number;
    page?: number
  } = {}): Promise<ApiResponse<PagePaginatedResponse<Admin>>> => {
    return apiGet<PagePaginatedResponse<Admin>>(`/v1/admins`, {size, page});
  },

  /**
   * 관리자 생성
   */
  createAdmin: async (adminData: CreateAdminRequest, nonce?: string): Promise<ApiResponse<Admin>> => {
    return apiPost<Admin>(`/v1/admin`, adminData, {nonce});
  },

  /**
   * 관리자 정보 수정 (부분 업데이트)
   */
  updateAdmin: async (adminId: string, adminData: UpdateAdminRequest): Promise<ApiResponse<Admin>> => {
    return apiPatch<Admin>(`/v1/admin/${adminId}`, adminData);
  }
}
