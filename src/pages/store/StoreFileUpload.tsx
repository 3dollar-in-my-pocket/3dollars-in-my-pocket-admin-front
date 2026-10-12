import {useSearchParams} from 'react-router-dom';
import StoreImportPanel from './fileUpload/StoreImportPanel';
import ThreadPostImportPanel from './fileUpload/ThreadPostImportPanel';

const TAB_PARAM = 'tab';

const TABS = [
  {key: 'store', label: '가게', icon: 'bi-shop'},
  {key: 'thread-post', label: 'Threads 포스트', icon: 'bi-threads'},
] as const;

type TabKey = typeof TABS[number]['key'];

const resolveTab = (value: string | null): TabKey =>
  TABS.find(tab => tab.key === value)?.key ?? TABS[0].key;

const StoreFileUpload = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveTab(searchParams.get(TAB_PARAM));

  const handleTabChange = (tab: TabKey) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === TABS[0].key) {
        next.delete(TAB_PARAM);
      } else {
        next.set(TAB_PARAM, tab);
      }
      return next;
    }, {replace: true});
  };

  return (
    <div>
      <ul className="nav nav-tabs mb-3" role="tablist" aria-label="등록 대상 선택">
        {TABS.map(tab => (
          <li key={tab.key} className="nav-item" role="presentation">
            <button
              type="button"
              role="tab"
              id={`store-file-upload-tab-${tab.key}`}
              aria-controls={`store-file-upload-panel-${tab.key}`}
              aria-selected={tab.key === activeTab}
              className={`nav-link${tab.key === activeTab ? ' active' : ''}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <i className={`bi ${tab.icon} me-1`}/>{tab.label}
            </button>
          </li>
        ))}
      </ul>

      {/* 탭을 오가도 선택한 파일과 검증 결과가 유지되도록 두 패널을 모두 마운트해 둡니다. */}
      {TABS.map(tab => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`store-file-upload-panel-${tab.key}`}
          aria-labelledby={`store-file-upload-tab-${tab.key}`}
          hidden={tab.key !== activeTab}
        >
          {tab.key === 'store' ? <StoreImportPanel/> : <ThreadPostImportPanel/>}
        </div>
      ))}
    </div>
  );
};

export default StoreFileUpload;
