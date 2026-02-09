import React from 'react';
import { useRecoilValue } from 'recoil';
import { AdminAuthState } from '../../state/AdminAuthState';
import { AdminRole } from '../../types/admin';
import { hasMenuAccess } from '../../utils/roleUtils';

interface PermissionGuardProps {
  allowedRoles?: AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 역할 기반 접근 제어 컴포넌트
 * 특정 역할만 접근 가능한 컴포넌트를 감쌀 때 사용
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const adminAuth = useRecoilValue(AdminAuthState);

  if (!adminAuth?.role) {
    return <>{fallback}</>;
  }

  if (!hasMenuAccess(adminAuth.role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;