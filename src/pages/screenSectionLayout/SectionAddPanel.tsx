import React, {useMemo, useState} from 'react';
import {SectionType, SectionTypeMeta} from '@/types/screenSectionLayout';

interface SectionAddPanelProps {
  /** 지금 추가할 수 있는 섹션 목록 (이미 추가된 중복 불가 섹션은 제외된 상태) */
  addableSectionTypes: SectionTypeMeta[];
  /** 아직 추가하지 않은 섹션이 없는지 여부와 무관하게, 화면에 정의된 전체 설정 가능 섹션 수 */
  totalConfigurableCount: number;
  disabled: boolean;
  onAdd: (sectionType: SectionType) => void;
}

/**
 * 추가할 섹션을 고르는 패널.
 *
 * 셀렉트 박스는 어떤 섹션이 남아 있는지 한 번에 보이지 않아, 추가 가능한 섹션을
 * 전부 펼쳐 놓고 클릭 한 번으로 목록 맨 아래에 붙이도록 했습니다.
 */
const SectionAddPanel: React.FC<SectionAddPanelProps> = ({
                                                           addableSectionTypes,
                                                           totalConfigurableCount,
                                                           disabled,
                                                           onAdd
                                                         }) => {
  const [keyword, setKeyword] = useState('');

  const filtered = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return addableSectionTypes;
    return addableSectionTypes.filter((meta) =>
      meta.label.toLowerCase().includes(trimmed) || meta.value.toLowerCase().includes(trimmed)
    );
  }, [addableSectionTypes, keyword]);

  if (addableSectionTypes.length === 0) {
    return (
      <div className="section-add">
        <p className="section-add__empty mb-0">
          이 화면에서 설정할 수 있는 섹션 {totalConfigurableCount}개를 모두 추가했습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="section-add">
      <div className="section-add__head">
        <span className="section-add__title">
          <i className="bi bi-plus-square me-1"/>섹션 추가
        </span>
        {/* 섹션이 15개 가까이 되므로 이름으로 추려서 찾을 수 있게 합니다. */}
        <input
          type="search"
          className="form-control form-control-sm section-add__search"
          placeholder="섹션 이름 검색"
          value={keyword}
          disabled={disabled}
          aria-label="추가할 섹션 검색"
          onChange={(event) => setKeyword(event.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="section-add__empty mb-0">검색 결과가 없습니다.</p>
      ) : (
        <div className="section-add__list">
          {filtered.map((meta) => (
            <button
              key={meta.value}
              type="button"
              className="section-add__item"
              disabled={disabled}
              onClick={() => onAdd(meta.value)}
              title={`${meta.label} (${meta.value}) 섹션을 목록 맨 아래에 추가합니다`}
            >
              <i className="bi bi-plus-lg" aria-hidden="true"/>
              <span className="section-add__item-label">{meta.label}</span>
              <span className="section-add__item-code font-monospace">{meta.value}</span>
              {meta.isRequired && <span className="section-chip section-chip--required">필수</span>}
              {meta.allowsMultiple && <span className="section-chip">중복 가능</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SectionAddPanel;
