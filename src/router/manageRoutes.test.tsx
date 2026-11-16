import {Suspense} from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {menuGroups} from '@/constants/menu';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import {hasMenuAccess} from '@/utils/roleUtils';
import manageRoutes from './manageRoutes';

vi.mock('./PrivateRouter', () => ({default: ({children}) => children}));
vi.mock('../pages/experiment/ExperimentOverrideManagement', () => ({
  default: () => <div>A/B 테스트 관리 화면</div>,
}));

describe('관리 메뉴 접근 권한', () => {
  it.each([AdminRole.OWNER, AdminRole.OPERATOR, AdminRole.VIEWER])(
    '%s의 A/B 테스트 메뉴와 직접 접근 권한이 일치한다',
    async role => {
      const menu = menuGroups.flatMap(group => group.items)
        .find(item => item.path === '/manage/push-ab-test');
      expect(menu).toBeDefined();
      expect(hasMenuAccess(role, menu!.allowedRoles)).toBe(role === AdminRole.OWNER);

      useAuthStore.setState({admin: {adminId: '1', name: '관리자', email: 'admin@example.com', role}});
      const route = manageRoutes.children.find(item => item.path === '/manage/push-ab-test');
      expect(route).toBeDefined();
      render(<Suspense fallback={null}>{route!.element}</Suspense>);

      if (role === AdminRole.OWNER) {
        expect(await screen.findByText('A/B 테스트 관리 화면')).toBeInTheDocument();
      } else {
        expect(screen.getByText('A/B 테스트 대상 관리는 오너만 접근할 수 있습니다.')).toBeInTheDocument();
        expect(screen.queryByText('A/B 테스트 관리 화면')).not.toBeInTheDocument();
      }
    }
  );

  it('유사 가게 찾기는 메뉴에서 제외한다', () => {
    expect(menuGroups.flatMap(group => group.items)
      .some(item => item.path === '/manage/proto/similar-store')).toBe(false);
  });
});
