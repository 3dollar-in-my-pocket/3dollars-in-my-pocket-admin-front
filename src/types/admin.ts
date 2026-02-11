/**
 * 관리자 관련 타입 정의
 */

export enum AdminRole {
  OWNER = 'OWNER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER'
}

export interface Admin {
  adminId: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  role: AdminRole;
  password?: string;
}

export interface UpdateAdminRequest {
  name?: string;
  role?: AdminRole;
}
