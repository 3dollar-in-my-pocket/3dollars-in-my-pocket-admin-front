/**
 * 관리자 관련 타입 정의
 */

export interface Admin {
  adminId: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password?: string;
}
