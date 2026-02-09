import { useRecoilValue } from 'recoil';
import { AdminAuthState } from '../state/AdminAuthState';
import { AdminRole } from '../types/admin';
import { hasMenuAccess } from '../utils/roleUtils';

/**
 * 권한 확인을 위한 커스텀 훅
 */
export const usePermission = () => {
  const adminAuth = useRecoilValue(AdminAuthState);

  return {
    /**
     * 현재 사용자의 역할
     */
    currentRole: adminAuth?.role || null,

    /**
     * 현재 사용자 정보
     */
    currentAdmin: adminAuth,

    /**
     * 특정 역할에 대한 접근 권한 확인
     */
    hasAccess: (allowedRoles?: AdminRole[]) => {
      if (!adminAuth?.role) return false;
      return hasMenuAccess(adminAuth.role, allowedRoles);
    },

    /**
     * 소유자 권한인지 확인
     */
    isOwner: () => adminAuth?.role === AdminRole.OWNER,

    /**
     * 서비스 운영자 권한인지 확인
     */
    isOperator: () => adminAuth?.role === AdminRole.OPERATOR,

    /**
     * 뷰어 권한인지 확인
     */
    isViewer: () => adminAuth?.role === AdminRole.VIEWER,
  };
};