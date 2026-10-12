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

/** 페이지 상단 탭. 좁은 화면에서는 줄바꿈 대신 가로 스크롤됩니다. */
const PageTabs = <K extends string>({id, tabs, activeKey, onChange, ariaLabel}: PageTabsProps<K>) => (
  <ul className="nav nav-tabs page-tabs mb-3" role="tablist" aria-label={ariaLabel}>
    {tabs.map(tab => (
      <li key={tab.key} className="nav-item" role="presentation">
        <button
          type="button"
          role="tab"
          id={getPageTabId(id, tab.key)}
          aria-controls={getPageTabPanelId(id, tab.key)}
          aria-selected={tab.key === activeKey}
          className={`nav-link${tab.key === activeKey ? ' active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.icon && <i className={`bi ${tab.icon} me-1`}/>}{tab.label}
        </button>
      </li>
    ))}
  </ul>
);

export default PageTabs;
