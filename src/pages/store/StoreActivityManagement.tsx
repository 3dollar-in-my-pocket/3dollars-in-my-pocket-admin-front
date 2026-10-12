import {lazy} from 'react';
import RoleTabsPage, {RoleTab} from '@/components/common/RoleTabsPage';
import {AdminRole} from '@/types/admin';

export type StoreActivityTabKey = 'review' | 'image' | 'report' | 'post' | 'coupon' | 'message';

const VIEWER_ROLES = [AdminRole.OPERATOR, AdminRole.VIEWER];

const TABS: RoleTab<StoreActivityTabKey>[] = [
  {
    key: 'review',
    label: '리뷰',
    icon: 'bi-chat-square-text',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('../review/ReviewManagement')),
  },
  {
    key: 'image',
    label: '이미지',
    icon: 'bi-image',
    component: lazy(() => import('../manage/StoreImageManage')),
  },
  {
    key: 'report',
    label: '신고 이력',
    icon: 'bi-flag-fill',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('../storeReport/StoreReportManagement')),
  },
  {
    key: 'post',
    label: '소식',
    icon: 'bi-newspaper',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('../storePost/StorePostManagement')),
  },
  {
    key: 'coupon',
    label: '쿠폰',
    icon: 'bi-ticket-perforated',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('../coupon/CouponManagement')),
  },
  {
    key: 'message',
    label: '메시지',
    icon: 'bi-chat-left-text',
    allowedRoles: VIEWER_ROLES,
    component: lazy(() => import('../storeMessage/StoreMessageManagement')),
  },
];

const StoreActivityManagement = () => (
  <RoleTabsPage id="store-activity" tabs={TABS} ariaLabel="가게 활동 선택"/>
);

export default StoreActivityManagement;
