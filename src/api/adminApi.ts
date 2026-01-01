import { ApiResponse, PagePaginatedResponse } from '../types/api';
import { Admin, CreateAdminRequest } from '../types/admin';
import { apiGet, apiPost } from './apiHelpers';

export default {
  /**
   * 내 관리자 정보 조회
   */
  getMyAdmin: async (): Promise<ApiResponse<Admin>> => {
    return apiGet<Admin>(`/v1/my/admin`);
  },

  /**
   * 관리자 목록 조회 (페이지 기반)
   */
  getAdmins: async ({size = 10, page = 1}: {size?: number; page?: number} = {}): Promise<ApiResponse<PagePaginatedResponse<Admin>>> => {
    return apiGet<PagePaginatedResponse<Admin>>(`/v1/admins`, { size, page });
  },

  /**
   * 관리자 생성
   */
  createAdmin: async (adminData: CreateAdminRequest): Promise<ApiResponse<Admin>> => {
    return apiPost<Admin>(`/v1/admin`, adminData);
  }
}
