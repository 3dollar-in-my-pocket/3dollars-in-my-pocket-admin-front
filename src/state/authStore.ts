
import {create} from 'zustand';
import {Admin, AdminRole} from '../types/admin';
import {LocalStorageService} from '../service/LocalStorageService';

interface AuthState {
  /** 현재 로그인된 관리자 정보. 미로그인 시 null */
  admin: Admin | null;
  /**
   * 로그인 여부.
   * 관리자 정보 조회 이전에도 인증 상태를 알아야 하므로 admin과 별도로 관리합니다.
   */
  isLoggedIn: boolean;

  setAdmin: (admin: Admin | null) => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  /** 로그인 성공 처리. 토큰 저장까지 함께 수행합니다. */
  login: (token: string) => void;
  /** 로그아웃 처리. 토큰 삭제와 상태 초기화를 함께 수행합니다. */
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isLoggedIn: false,

  setAdmin: (admin) => set({admin}),

  setLoggedIn: (isLoggedIn) => set({isLoggedIn}),

  login: (token) => {
    LocalStorageService.set('AUTH_TOKEN', token);
    set({isLoggedIn: true});
  },

  logout: () => {
    LocalStorageService.delete('AUTH_TOKEN');
    set({admin: null, isLoggedIn: false});
  },
}));

/**
 * 현재 관리자의 역할을 반환합니다.
 */
export const useCurrentRole = (): AdminRole | null =>
  useAuthStore((state) => state.admin?.role ?? null);
