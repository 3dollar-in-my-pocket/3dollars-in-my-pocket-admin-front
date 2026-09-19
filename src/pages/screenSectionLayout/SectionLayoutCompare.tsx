import React from 'react';
import {ScreenType} from '@/types/screenSectionLayout';
import {getSectionTypeLabel} from '@/constants/screenSectionLayout';
import {SectionLayoutDraft} from './useSectionLayoutDraft';
import {SectionDiffStatus, SectionLayoutDiff} from './sectionLayoutDiff';

interface SectionLayoutCompareProps {
  screenType: ScreenType;
  /** 마지막으로 저장된(서버 기준) 목록 */
  before: SectionLayoutDraft[];
  /** 편집 중인 목록 */
  after: SectionLayoutDraft[];
  diff: SectionLayoutDiff;
}

/** 편집 후 목록에서 sectionId별 상태를 빠르게 찾기 위한 맵 */
const buildStatusMap = (diff: SectionLayoutDiff) =>
  new Map(diff.entries.map((entry) => [entry.sectionId, entry]));

const STATUS_CLASS: Record<SectionDiffStatus, string> = {
  added: 'compare-item--added',
  removed: 'compare-item--removed',
  moved: 'compare-item--moved',
  updated: 'compare-item--updated',
  unchanged: '',
};

const STATUS_LABEL: Record<SectionDiffStatus, string> = {
  added: '추가',
  removed: '삭제',
  moved: '이동',
  updated: '변경',
  unchanged: '',
};

interface ColumnItemProps {
  screenType: ScreenType;
  section: SectionLayoutDraft;
  order: number;
  status: SectionDiffStatus;
  /** 반대쪽 목록에서의 순서. 이동한 경우 화살표로 표시합니다. */
  counterpartOrder: number | null;
}

const ColumnItem: React.FC<ColumnItemProps> = ({screenType, section, order, status, counterpartOrder}) => {
  const label = getSectionTypeLabel(screenType, section.sectionType);
  const moved = status === 'moved' && counterpartOrder !== null && counterpartOrder !== order;

  return (
    <li className={`compare-item ${STATUS_CLASS[status]}`}>
      <span className="compare-item__order">{order}</span>
      <span className="compare-item__body">
        <span className="compare-item__name">
          {label}
          {!section.isVisible && (
            <i className="bi bi-eye-slash ms-1 text-body-secondary" title="미노출"/>
          )}
        </span>
        <span className="compare-item__id font-monospace">{section.sectionId}</span>
      </span>
      <span className="compare-item__meta">
        {moved && (
          <span className="compare-item__moved">
            <i className="bi bi-arrow-down-up me-1"/>{counterpartOrder}
          </span>
        )}
        {status !== 'unchanged' && !moved && (
          <span className="compare-item__tag">{STATUS_LABEL[status]}</span>
        )}
        <span className="compare-item__margin" title="하단 여백">{section.marginBottom}</span>
      </span>
    </li>
  );
};

/**
 * 저장 전/후 섹션 구성을 좌우로 나란히 보여줍니다.
 *
 * 전체 교체(PUT) 방식이라 저장하면 오른쪽 목록이 그대로 반영되고 왼쪽에만 있는 섹션은
 * 삭제되므로, 두 목록을 나란히 놓고 무엇이 달라지는지 바로 볼 수 있게 합니다.
 */
const SectionLayoutCompare: React.FC<SectionLayoutCompareProps> = ({
                                                                    screenType,
                                                                    before,
                                                                    after,
                                                                    diff
                                                                  }) => {
  const statusByKey = buildStatusMap(diff);

  const statusOf = (section: SectionLayoutDraft, side: 'before' | 'after'): SectionDiffStatus => {
    const entry = statusByKey.get(section.sectionId.trim());
    if (!entry) return 'unchanged';
    // 왼쪽(저장 상태)에는 '추가'가, 오른쪽(편집 상태)에는 '삭제'가 존재할 수 없습니다.
    if (side === 'before' && entry.status === 'added') return 'unchanged';
    if (side === 'after' && entry.status === 'removed') return 'unchanged';
    return entry.status;
  };

  const counterpartOf = (section: SectionLayoutDraft, side: 'before' | 'after'): number | null => {
    const entry = statusByKey.get(section.sectionId.trim());
    if (!entry) return null;
    return side === 'before' ? entry.afterOrder : entry.beforeOrder;
  };

  const renderColumn = (
    sections: SectionLayoutDraft[],
    side: 'before' | 'after'
  ) => {
    if (sections.length === 0) {
      return (
        <p className="text-body-secondary small mb-0 py-3 text-center">
          {side === 'before' ? '저장된 섹션이 없습니다.' : '섹션이 없습니다.'}
        </p>
      );
    }

    return (
      <ol className="compare-list">
        {sections.map((section, index) => (
          <ColumnItem
            key={section.key}
            screenType={screenType}
            section={section}
            order={index + 1}
            status={statusOf(section, side)}
            counterpartOrder={counterpartOf(section, side)}
          />
        ))}
      </ol>
    );
  };

  return (
    <div className="row g-3">
      <div className="col-12 col-lg-6">
        <div className="compare-column">
          <div className="compare-column__head">
            <span className="compare-column__title">
              <i className="bi bi-clock-history me-1"/>변경 전 (저장된 상태)
            </span>
            <span className="compare-column__count">{before.length}개</span>
          </div>
          {renderColumn(before, 'before')}
        </div>
      </div>

      <div className="col-12 col-lg-6">
        <div className="compare-column compare-column--after">
          <div className="compare-column__head">
            <span className="compare-column__title">
              <i className="bi bi-pencil-square me-1"/>변경 후 (저장 시 반영)
            </span>
            <span className="compare-column__count">{after.length}개</span>
          </div>
          {renderColumn(after, 'after')}
        </div>
      </div>
    </div>
  );
};

export default SectionLayoutCompare;
