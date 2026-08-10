import React, {useEffect, useState} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import DetailModalTabTitle from '@/components/common/DetailModalTabTitle';
import EmptyState from '@/components/common/EmptyState';
import Loading from '@/components/common/Loading';
import {ActivityAuthor} from '@/types/domain';
import {SimpleStore} from '@/types/store';

/** ActivityHistory가 렌더링하는 탭 하나의 설정 */
export interface ActivityTabConfig {
  /** 탭 식별자 (eventKey) */
  key: string;
  /** 탭 라벨 */
  title: string;
  /** Bootstrap Icons 클래스 (예: 'bi-newspaper') */
  icon: string;
  /**
   * 탭 본문 컴포넌트.
   *
   * type에 따라 {userId} 또는 {storeId}와 isActive/onAuthorClick/onStoreClick이
   * 스프레드로 전달됩니다. 탭마다 실제로 받는 props 집합이 달라(예: 가게 이력은
   * onStoreClick을 받지 않음) 구체 타입으로 좁히면 호출부 배열이 통과하지 못하므로,
   * 공통 상위 타입인 ComponentType<any>로 둡니다.
   */
  component: React.ComponentType<any>;
  /**
   * 로딩 스피너 색상 클래스
   * @deprecated 공통 Loading 컴포넌트를 사용하므로 더 이상 반영되지 않습니다.
   */
  spinnerColor?: string;
  /**
   * 로딩 문구
   * @deprecated 공통 Loading 컴포넌트를 사용하므로 더 이상 반영되지 않습니다.
   */
  loadingText?: string;
  /** false면 탭을 비활성화하고 미지원 안내를 표시합니다. */
  isSupported?: boolean;
  /** 탭 라벨 옆 배지 표시 여부 */
  showBadge?: boolean;
  /** 배지 문구 (기본 '준비중') */
  badgeText?: string;
}

export type ActivityHistoryType = 'user' | 'store';

interface ActivityHistoryProps {
  /** 'user'면 하위 탭에 userId를, 'store'면 storeId를 전달합니다. */
  type: ActivityHistoryType;
  /** userId 또는 storeId. 호출부에서 undefined가 전달될 수 있습니다. */
  entityId?: string | number;
  /** 탭 설정 배열 */
  tabs?: ActivityTabConfig[];
  /** 초기 활성 탭 key. 호출부에 따라 null이 전달됩니다. */
  initialActiveTab?: string | null;
  /** 작성자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const ActivityHistory: React.FC<ActivityHistoryProps> = ({
                                                           type, // 'user' or 'store'
                                                           entityId, // userId or storeId
                                                           tabs = [], // 탭 설정 배열
                                                           initialActiveTab = null, // 초기 활성 탭
                                                           onAuthorClick = null, // 작성자 클릭 핸들러
                                                           onStoreClick = null // 가게 클릭 핸들러
                                                         }) => {
  const getInitialTab = (): string => {
    if (initialActiveTab && tabs.find(tab => tab.key === initialActiveTab)) {
      return initialActiveTab;
    }
    return tabs.length > 0 ? tabs[0].key : '';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(getInitialTab() ? [getInitialTab()] : []));

  useEffect(() => {
    const newActiveTab = getInitialTab();
    if (newActiveTab && newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
      setLoadedTabs(prev => new Set([...prev, newActiveTab]));
    }
  }, [initialActiveTab]);

  const handleTabChange = (tabKey: string | null) => {
    if (!tabKey) return;

    const tab = tabs.find(t => t.key === tabKey);

    // 지원하지 않는 기능은 클릭을 무시 (비활성화된 상태)
    if (tab && tab.isSupported === false) {
      return;
    }

    setActiveTab(tabKey);
    setLoadedTabs(prev => new Set([...prev, tabKey]));
  };

  if (!tabs || tabs.length === 0) {
    return (
      <EmptyState
        icon="bi-activity"
        title="활동 탭이 설정되지 않았습니다"
        description="활동 이력을 표시할 탭을 설정해주세요."
      />
    );
  }

  return (
    <div className="activity-history">
      <Tabs
        activeKey={activeTab}
        onSelect={handleTabChange}
        className="border-0"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.key}
            eventKey={tab.key}
            disabled={tab.isSupported === false}
            title={
              <DetailModalTabTitle
                icon={tab.icon}
                label={tab.title}
                unsupported={tab.isSupported === false}
              />
            }
          >
            {tab.isSupported === false ? (
              <EmptyState
                icon={tab.icon}
                title={`${tab.title} 기능 미지원`}
                description={
                  `이 기능은 ${tab.key === 'posts' || tab.key === 'messages' ? '사장님 가게' : '노점상 가게'}에서만 사용할 수 있습니다.`
                }
              />
            ) : loadedTabs.has(tab.key) ? (
              <tab.component
                {...(type === 'user' ? {userId: entityId} : {storeId: entityId})}
                isActive={activeTab === tab.key}
                onAuthorClick={onAuthorClick}
                onStoreClick={onStoreClick}
              />
            ) : (
              <div className="py-5">
                <Loading/>
              </div>
            )}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
};

export default ActivityHistory;
