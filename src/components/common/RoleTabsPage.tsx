import {ComponentType, LazyExoticComponent, Suspense, useMemo} from 'react';
import PageTabs, {getPageTabId, getPageTabPanelId, PageTabItem} from '@/components/common/PageTabs';
import PageLoading from '@/components/common/PageLoading';
import EmptyState from '@/components/common/EmptyState';
import useTabParam from '@/hooks/useTabParam';
import {useAuthStore} from '@/state/authStore';
import {AdminRole} from '@/types/admin';
import {hasMenuAccess} from '@/utils/roleUtils';

export interface RoleTab<K extends string> extends PageTabItem<K> {
  /** 접근 가능한 역할 (정의되지 않으면 OWNER만 접근 가능) */
  allowedRoles?: AdminRole[];
  component: LazyExoticComponent<ComponentType>;
}

interface RoleTabsPageProps<K extends string> {
  /** 탭/패널 id 접두사 (페이지마다 고유해야 함) */
  id: string;
  tabs: readonly RoleTab<K>[];
  ariaLabel?: string;
}

/**
 * 역할별로 노출 탭이 다른 페이지.
 * 선택한 탭의 화면만 불러와 렌더링해 탭마다 API가 한꺼번에 호출되지 않도록 합니다.
 * 선택한 탭은 URL 쿼리(?tab=)에 반영되며, 권한 없는 탭이면 첫 번째 탭을 보여줍니다.
 */
const RoleTabsPage = <K extends string>({id, tabs, ariaLabel}: RoleTabsPageProps<K>) => {
  const role = useAuthStore(state => state.admin?.role);
  const visibleTabs = useMemo(
    () => role ? tabs.filter(tab => hasMenuAccess(role, tab.allowedRoles)) : [],
    [role, tabs]
  );
  const visibleKeys = useMemo(() => visibleTabs.map(tab => tab.key), [visibleTabs]);
  const [activeKey, setActiveKey] = useTabParam(visibleKeys);
  const activeTab = visibleTabs.find(tab => tab.key === activeKey);

  if (!activeTab) {
    return (
      <EmptyState
        icon="bi-lock-fill"
        title="접근 권한이 없습니다"
        description="이 화면에 접근할 수 있는 권한이 없습니다."
      />
    );
  }

  const ActiveComponent = activeTab.component;

  return (
    <div>
      <PageTabs id={id} tabs={visibleTabs} activeKey={activeTab.key} onChange={setActiveKey} ariaLabel={ariaLabel}/>
      <div role="tabpanel" id={getPageTabPanelId(id, activeTab.key)} aria-labelledby={getPageTabId(id, activeTab.key)}>
        <Suspense fallback={<PageLoading/>}>
          <ActiveComponent/>
        </Suspense>
      </div>
    </div>
  );
};

export default RoleTabsPage;
