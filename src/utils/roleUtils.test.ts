import {describe, expect, it} from 'vitest';
import {AdminRole} from '@/types/admin';
import {filterMenuItemsByRole, hasMenuAccess} from './roleUtils';

describe('hasMenuAccess', () => {
  describe('OWNER', () => {
    it('allowedRoles와 무관하게 모든 메뉴에 접근한다', () => {
      expect(hasMenuAccess(AdminRole.OWNER)).toBe(true);
      expect(hasMenuAccess(AdminRole.OWNER, [])).toBe(true);
      expect(hasMenuAccess(AdminRole.OWNER, [AdminRole.VIEWER])).toBe(true);
    });
  });

  describe('OWNER 외 역할', () => {
    // 기본 거부: allowedRoles를 명시하지 않은 메뉴는 OWNER 전용이다
    it('allowedRoles가 없으면 접근을 거부한다', () => {
      expect(hasMenuAccess(AdminRole.OPERATOR)).toBe(false);
      expect(hasMenuAccess(AdminRole.VIEWER)).toBe(false);
    });

    it('allowedRoles가 빈 배열이면 접근을 거부한다', () => {
      expect(hasMenuAccess(AdminRole.OPERATOR, [])).toBe(false);
    });

    it('allowedRoles에 포함되면 접근을 허용한다', () => {
      expect(hasMenuAccess(AdminRole.OPERATOR, [AdminRole.OPERATOR])).toBe(true);
      expect(hasMenuAccess(AdminRole.VIEWER, [AdminRole.OPERATOR, AdminRole.VIEWER])).toBe(true);
    });

    it('allowedRoles에 없으면 접근을 거부한다', () => {
      expect(hasMenuAccess(AdminRole.VIEWER, [AdminRole.OPERATOR])).toBe(false);
    });
  });
});

describe('filterMenuItemsByRole', () => {
  const items = [
    {name: '대시보드', allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER]},
    {name: '관리자 관리'},
    {name: '푸시 발송', allowedRoles: [AdminRole.OPERATOR]}
  ];

  it('OWNER는 모든 항목을 본다', () => {
    const filtered = filterMenuItemsByRole(items, AdminRole.OWNER);

    expect(filtered).toHaveLength(3);
  });

  it('OPERATOR는 허용된 항목만 본다', () => {
    const filtered = filterMenuItemsByRole(items, AdminRole.OPERATOR);

    expect(filtered.map(item => item.name)).toEqual(['대시보드', '푸시 발송']);
  });

  it('VIEWER는 자신에게 허용된 항목만 본다', () => {
    const filtered = filterMenuItemsByRole(items, AdminRole.VIEWER);

    expect(filtered.map(item => item.name)).toEqual(['대시보드']);
  });

  it('빈 목록이면 빈 배열을 반환한다', () => {
    expect(filterMenuItemsByRole([], AdminRole.OWNER)).toEqual([]);
  });

  it('원본 배열을 변경하지 않는다', () => {
    filterMenuItemsByRole(items, AdminRole.VIEWER);

    expect(items).toHaveLength(3);
  });
});
