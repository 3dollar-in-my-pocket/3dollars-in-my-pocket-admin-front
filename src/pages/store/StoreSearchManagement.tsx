import {lazy} from 'react';
import RoleTabsPage, {RoleTab} from '@/components/common/RoleTabsPage';
import {AdminRole} from '@/types/admin';

export type StoreSearchTabKey = 'search' | 'popular';

const VIEWER_ROLES = [AdminRole.OPERATOR, AdminRole.VIEWER];

const TABS: RoleTab<StoreSearchTabKey>[] = [
  {
    key: 'search',
    label: '가게 검색',
    icon: 'bi-search',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('./StoreSearch')),
  },
  {
    key: 'popular',
    label: '인기 가게',
    icon: 'bi-star-fill',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('./PopularNeighborhoodStores')),
  },
];

/** 가게 검색 (키워드 검색 / 지역별 인기 가게). 선택한 탭은 URL(?tab=)에 유지됩니다. */
const StoreSearchManagement = () => (
  <RoleTabsPage id="store-search" tabs={TABS} ariaLabel="가게 조회 방식 선택"/>
);

export default StoreSearchManagement;
