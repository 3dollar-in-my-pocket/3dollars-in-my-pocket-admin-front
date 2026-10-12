import {ComponentType, lazy, LazyExoticComponent, Suspense, useMemo} from 'react';
import PageTabs, {getPageTabId, getPageTabPanelId, PageTabItem} from '@/components/common/PageTabs';
import PageLoading from '@/components/common/PageLoading';
import EmptyState from '@/components/common/EmptyState';
import useTabParam from '@/hooks/useTabParam';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import {hasMenuAccess} from '@/utils/roleUtils';

const PAGE_ID = 'store-activity';

export type StoreActivityTabKey = 'review' | 'image' | 'report' | 'post' | 'coupon' | 'message';

interface StoreActivityTab extends PageTabItem<StoreActivityTabKey> {
  /** 접근 가능한 역할 (정의되지 않으면 OWNER만 접근 가능) */
  allowedRoles?: AdminRole[];
  component: LazyExoticComponent<ComponentType>;
}

const VIEWER_ROLES = [AdminRole.OPERATOR, AdminRole.VIEWER];

// 선택한 탭의 화면만 불러와 렌더링해 탭마다 API가 한꺼번에 호출되지 않도록 합니다.
const TABS: StoreActivityTab[] = [
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

const StoreActivityManagement = () => {
  const role = useAuthStore(state => state.admin?.role);
  const visibleTabs = useMemo(
    () => role ? TABS.filter(tab => hasMenuAccess(role, tab.allowedRoles)) : [],
    [role]
  );
  const visibleKeys = useMemo(() => visibleTabs.map(tab => tab.key), [visibleTabs]);
  const [activeKey, setActiveKey] = useTabParam(visibleKeys);
  const activeTab = visibleTabs.find(tab => tab.key === activeKey);

  if (!activeTab) {
    return (
      <EmptyState
        icon="bi-lock-fill"
        title="접근 권한이 없습니다"
        description="가게 활동 관리 화면에 접근할 수 있는 권한이 없습니다."
      />
    );
  }

  const ActiveComponent = activeTab.component;

  return (
    <div>
      <PageTabs id={PAGE_ID} tabs={visibleTabs} activeKey={activeTab.key} onChange={setActiveKey}
                ariaLabel="가게 활동 선택"/>
      <div
        role="tabpanel"
        id={getPageTabPanelId(PAGE_ID, activeTab.key)}
        aria-labelledby={getPageTabId(PAGE_ID, activeTab.key)}
      >
        <Suspense fallback={<PageLoading/>}>
          <ActiveComponent/>
        </Suspense>
      </div>
    </div>
  );
};

export default StoreActivityManagement;
