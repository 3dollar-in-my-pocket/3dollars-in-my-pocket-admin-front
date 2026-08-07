import React, {useState, useEffect} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import {ActivityAuthor} from '@/types/domain';
import {SimpleStore} from '@/types/store';
import '../styles/mobile-tabs.css';

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
  /** 로딩 스피너 색상 클래스 (기본 'text-primary') */
  spinnerColor?: string;
  /** 로딩 문구 (기본 '데이터를 불러오는 중...') */
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

  const getTitle = () => {
    return type === 'user' ? '활동 이력' : '가게 활동 이력';
  };

  const getIcon = () => {
    return type === 'user' ? 'bi-activity' : 'bi-activity';
  };

  if (!tabs || tabs.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-5">
          <div className="bg-light rounded-circle mx-auto mb-4"
               style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className={`bi ${getIcon()} fs-1 text-secondary`}></i>
          </div>
          <h5 className="text-dark mb-2">활동 탭이 설정되지 않았습니다</h5>
          <p className="text-muted">활동 이력을 표시할 탭을 설정해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 p-sm-2 p-md-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 p-2 p-sm-3 p-md-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-info bg-opacity-10 rounded-circle p-2">
              <i className={`bi ${getIcon()} text-info`}></i>
            </div>
            <h5 className="mb-0 fw-bold text-dark">{getTitle()}</h5>
          </div>
        </div>
        <div className="card-body p-0">
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="nav-fill border-0 px-1 px-sm-2 px-md-3 pt-2 pt-md-3 mobile-sub-tabs"
            style={{
              background: '#ffffff',
              overflowX: 'auto',
              flexWrap: 'nowrap'
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                eventKey={tab.key}
                disabled={tab.isSupported === false}
                title={
                  <span
                    className={`d-flex align-items-center gap-1 gap-md-2 px-1 py-2 ${tab.isSupported === false ? 'text-muted' : ''}`}
                    style={{
                      fontSize: window.innerWidth <= 768 ? '0.8rem' : '0.9rem',
                      whiteSpace: 'nowrap',
                      minWidth: 'fit-content'
                    }}>
                    <i className={`bi ${tab.icon}`} style={{fontSize: '0.85rem'}}></i>
                    <span className="fw-medium d-none d-sm-inline">{tab.title}</span>
                    <span
                      className="fw-medium d-sm-none">{tab.title.length > 4 ? tab.title.substring(0, 3) + '...' : tab.title}</span>
                    {tab.isSupported === false && (
                      <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{
                        fontSize: '0.6rem',
                        minWidth: '0.8rem',
                        height: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        X
                      </span>
                    )}
                    {tab.showBadge && tab.isSupported !== false && (
                      <span className="badge bg-secondary rounded-pill ms-1" style={{
                        fontSize: '0.6rem',
                        minWidth: '0.8rem',
                        height: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {tab.badgeText || '준비중'}
                      </span>
                    )}
                  </span>
                }
              >
                <div className="pt-0">
                  {tab.isSupported === false ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle mx-auto mb-3" style={{
                        width: '80px',
                        height: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`bi ${tab.icon} fs-1 text-secondary`}></i>
                      </div>
                      <h5 className="text-dark mb-2">{tab.title} 기능 미지원</h5>
                      <p className="text-muted mb-3">
                        이 기능은 {tab.key === 'posts' || tab.key === 'messages' ? '사장님 가게' : '노점상 가게'}에서만 사용할 수 있습니다.
                      </p>
                      <div className="alert alert-info d-inline-block">
                        <i className="bi bi-info-circle me-2"></i>
                        가게 타입에 따라 지원되는 기능이 다릅니다.
                      </div>
                    </div>
                  ) : loadedTabs.has(tab.key) ? (
                    <tab.component
                      {...(type === 'user' ? {userId: entityId} : {storeId: entityId})}
                      isActive={activeTab === tab.key}
                      onAuthorClick={onAuthorClick}
                      onStoreClick={onStoreClick}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <div className={`spinner-border ${tab.spinnerColor || 'text-primary'}`} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">{tab.loadingText || '데이터를 불러오는 중...'}</p>
                    </div>
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ActivityHistory;
