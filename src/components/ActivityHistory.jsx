import { useState, useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getFeatureUnsupportedMessage } from '../types/store';

const ActivityHistory = ({
  type, // 'user' or 'store'
  entityId, // userId or storeId
  tabs = [], // 탭 설정 배열
  initialActiveTab = null, // 초기 활성 탭
  onAuthorClick = null, // 작성자 클릭 핸들러
  onStoreClick = null // 가게 클릭 핸들러
}) => {
  const getInitialTab = () => {
    if (initialActiveTab && tabs.find(tab => tab.key === initialActiveTab)) {
      return initialActiveTab;
    }
    return tabs.length > 0 ? tabs[0].key : '';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [loadedTabs, setLoadedTabs] = useState(new Set(getInitialTab() ? [getInitialTab()] : []));

  useEffect(() => {
    const newActiveTab = getInitialTab();
    if (newActiveTab && newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
      setLoadedTabs(prev => new Set([...prev, newActiveTab]));
    }
  }, [initialActiveTab]);

  const handleTabChange = (tabKey) => {
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
          <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className={`bi ${getIcon()} fs-1 text-secondary`}></i>
          </div>
          <h5 className="text-dark mb-2">활동 탭이 설정되지 않았습니다</h5>
          <p className="text-muted">활동 이력을 표시할 탭을 설정해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0 p-4">
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
            className="nav-fill border-0 px-3 pt-3"
            style={{
              background: '#ffffff'
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                eventKey={tab.key}
                disabled={tab.isSupported === false}
                title={
                  <span className={`d-flex align-items-center gap-2 ${tab.isSupported === false ? 'text-muted' : ''}`}>
                    <i className={`bi ${tab.icon}`}></i>
                    {tab.title}
                    {tab.isSupported === false && (
                      <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                        미지원
                      </span>
                    )}
                    {tab.showBadge && tab.isSupported !== false && (
                      <span className="badge bg-secondary rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                        {tab.badgeText || '준비중'}
                      </span>
                    )}
                  </span>
                }
              >
                <div className="pt-0">
                  {tab.isSupported === false ? (
                    <div className="text-center py-5">
                      <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                      {...(type === 'user' ? { userId: entityId } : { storeId: entityId })}
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