import { atom } from 'recoil';
import { Admin, AdminRole } from '../types/admin';

/**
 * 현재 로그인된 관리자 정보를 저장하는 Recoil atom
 */
export const AdminAuthState = atom<Admin | null>({
  key: 'adminAuthState',
  default: null,
});

/**
 * 로그인 상태를 나타내는 Recoil atom (기존 LoginStatus와 호환성 유지)
 */
export const LoginStatus = atom<boolean>({
  key: 'loginStatus',
  default: false,
});

/**
 * 현재 관리자의 역할을 반환하는 selector (편의를 위해)
 */
export const getCurrentAdminRole = (admin: Admin | null): AdminRole | null => {
  return admin?.role || null;
};