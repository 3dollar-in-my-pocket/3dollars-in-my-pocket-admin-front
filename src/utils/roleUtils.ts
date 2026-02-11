import { AdminRole } from '../types/admin';

/**
 * 역할 기반 접근 제어 유틸리티 함수들
 */

/**
 * 특정 역할이 메뉴 항목에 접근할 수 있는지 확인
 * 기본적으로 OWNER만 접근 가능하며, allowedRoles에 명시된 역할만 추가 접근 가능
 */
export const hasMenuAccess = (userRole: AdminRole, allowedRoles?: AdminRole[]): boolean => {
  // OWNER는 모든 메뉴에 접근 가능
  if (userRole === AdminRole.OWNER) {
    return true;
  }

  // allowedRoles가 정의되지 않은 경우 OWNER만 접근 가능 (기본값)
  if (!allowedRoles || allowedRoles.length === 0) {
    return false;
  }

  // 사용자의 역할이 허용된 역할 목록에 포함되어 있는지 확인
  return allowedRoles.includes(userRole);
};

/**
 * 메뉴 그룹에서 사용자가 접근 가능한 항목들만 필터링
 */
export const filterMenuItemsByRole = (items: any[], userRole: AdminRole) => {
  return items.filter(item => hasMenuAccess(userRole, item.allowedRoles));
};

/**
 * 역할별 권한 확인
 */
export const canAccessAdminManagement = (userRole: AdminRole): boolean => {
  return userRole === AdminRole.OWNER;
};

/**
 * 역할 표시명 반환
 */
export const getRoleDisplayName = (role: AdminRole): string => {
  switch (role) {
    case AdminRole.OWNER:
      return '소유자';
    case AdminRole.OPERATOR:
      return '서비스 운영자';
    case AdminRole.VIEWER:
      return '뷰어';
    default:
      return role;
  }
};