export interface PageTabItem<K extends string = string> {
  key: K;
  label: string;
  icon?: string;
}

interface PageTabsProps<K extends string> {
  /** 탭/패널 id 접두사 (페이지마다 고유해야 함) */
  id: string;
  tabs: readonly PageTabItem<K>[];
  activeKey: K;
  onChange: (key: K) => void;
  ariaLabel?: string;
}

export const getPageTabId = (id: string, key: string) => `${id}-tab-${key}`;
export const getPageTabPanelId = (id: string, key: string) => `${id}-panel-${key}`;

/** 페이지 상단 탭. 좁은 화면에서는 가로 스크롤됩니다. (스타일: page.css "페이지 내 탭") */
const PageTabs = <K extends string>({id, tabs, activeKey, onChange, ariaLabel}: PageTabsProps<K>) => (
  <div className="page-tabs" role="tablist" aria-label={ariaLabel}>
    {tabs.map(tab => (
      <button
        key={tab.key}
        type="button"
        role="tab"
        id={getPageTabId(id, tab.key)}
        aria-controls={getPageTabPanelId(id, tab.key)}
        aria-selected={tab.key === activeKey}
        className={`page-tab${tab.key === activeKey ? ' page-tab--active' : ''}`}
        onClick={() => onChange(tab.key)}
      >
        {tab.icon && <i className={`bi ${tab.icon}`}/>}
        {tab.label}
      </button>
    ))}
  </div>
);

export default PageTabs;
