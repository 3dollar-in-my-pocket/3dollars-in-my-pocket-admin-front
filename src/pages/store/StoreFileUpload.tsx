import PageTabs, {getPageTabId, getPageTabPanelId} from '@/components/common/PageTabs';
import useTabParam from '@/hooks/useTabParam';
import StoreImportPanel from './fileUpload/StoreImportPanel';
import SnsPostImportPanel from './fileUpload/SnsPostImportPanel';

const PAGE_ID = 'store-file-upload';

const TABS = [
  {key: 'store', label: '가게', icon: 'bi-shop'},
  {key: 'sns-post', label: 'SNS 포스트', icon: 'bi-link-45deg'},
] as const;

type TabKey = typeof TABS[number]['key'];
const TAB_KEYS = TABS.map(tab => tab.key);

const StoreFileUpload = () => {
  const [activeTab = 'store', setActiveTab] = useTabParam<TabKey>(TAB_KEYS);

  return (
    <div>
      <PageTabs id={PAGE_ID} tabs={TABS} activeKey={activeTab} onChange={setActiveTab} ariaLabel="등록 대상 선택"/>

      {/* 탭을 오가도 선택한 파일과 검증 결과가 유지되도록 두 패널을 모두 마운트해 둡니다. */}
      {TABS.map(tab => (
        <div
          key={tab.key}
          role="tabpanel"
          id={getPageTabPanelId(PAGE_ID, tab.key)}
          aria-labelledby={getPageTabId(PAGE_ID, tab.key)}
          hidden={tab.key !== activeTab}
        >
          {tab.key === 'store' ? <StoreImportPanel/> : <SnsPostImportPanel/>}
        </div>
      ))}
    </div>
  );
};

export default StoreFileUpload;
