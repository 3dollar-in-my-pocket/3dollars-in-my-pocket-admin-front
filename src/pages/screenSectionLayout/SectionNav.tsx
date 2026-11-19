import React from 'react';

export interface SectionNavItem {
  key: string;
  label: string;
  isVisible: boolean;
  hasError: boolean;
  isChanged: boolean;
}

interface SectionNavProps {
  items: SectionNavItem[];
  activeKey: string | null;
  onSelect: (key: string) => void;
}

/**
 * 섹션 바로가기 목록.
 *
 * 미리보기가 없는 화면(예: HOME)은 섹션마다 설정이 길어 목록이 길어지므로,
 * 원하는 섹션으로 바로 이동하고 오류·변경 여부를 한눈에 볼 수 있게 합니다.
 */
const SectionNav: React.FC<SectionNavProps> = ({items, activeKey, onSelect}) => (
  <nav aria-label="섹션 바로가기">
    <ol className="section-nav">
      {items.map((item, index) => (
        <li key={item.key}>
          <button
            type="button"
            className={`section-nav__item${activeKey === item.key ? ' is-active' : ''}`}
            aria-current={activeKey === item.key ? 'true' : undefined}
            onClick={() => onSelect(item.key)}
          >
            <span className="section-nav__index">{index + 1}</span>
            <span className={`section-nav__label${item.isVisible ? '' : ' is-hidden'}`}>{item.label}</span>
            {!item.isVisible && <i className="bi bi-eye-slash text-body-secondary" title="미노출" aria-label="미노출"/>}
            {item.isChanged && !item.hasError && (
              <span className="section-nav__badge section-nav__badge--changed" title="변경됨">변경</span>
            )}
            {item.hasError && (
              <i className="bi bi-exclamation-circle-fill text-danger" title="입력 오류" aria-label="입력 오류"/>
            )}
          </button>
        </li>
      ))}
    </ol>
  </nav>
);

export default SectionNav;
