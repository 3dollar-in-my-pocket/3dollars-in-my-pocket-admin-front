import {lazy} from 'react';
import RoleTabsPage, {RoleTab} from '@/components/common/RoleTabsPage';
import {AdminRole} from '@/types/admin';

export type StatisticsTabKey = 'server' | 'client' | 'ad' | 'push';

const TABS: RoleTab<StatisticsTabKey>[] = [
  {
    key: 'server',
    label: '서버 통계',
    icon: 'bi-hdd-network',
    allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER],
    component: lazy(() => import('./ServerStatistics')),
  },
  {
    key: 'client',
    label: '클라이언트 통계 (GA)',
    icon: 'bi-google',
    allowedRoles: [AdminRole.OPERATOR, AdminRole.VIEWER],
    component: lazy(() => import('./ClientStatInfo')),
  },
  {
    key: 'ad',
    label: '광고 통계',
    icon: 'bi-badge-ad',
    allowedRoles: [AdminRole.OPERATOR],
    component: lazy(() => import('./AdStatInfo')),
  },
  {
    key: 'push',
    label: '푸시 통계',
    icon: 'bi-bar-chart-line-fill',
    allowedRoles: [AdminRole.OPERATOR],
    component: lazy(() => import('./PushStatInfo')),
  },
];

const Statistics = () => <RoleTabsPage id="statistics" tabs={TABS} ariaLabel="통계 종류 선택"/>;

export default Statistics;
