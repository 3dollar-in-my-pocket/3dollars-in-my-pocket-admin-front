import React, {useEffect, useRef} from 'react';

interface BulkSelectionToolbarProps {
  /** 선택된 개수 */
  selectedCount: number;
  /** 선택 가능한 총 개수 (max 반영) */
  selectableCount: number;
  /** 전체 선택 여부 */
  isAllSelected: boolean;
  /** 일부만 선택된 상태 (체크박스 indeterminate 표시) */
  isPartiallySelected: boolean;
  /** 전체 선택 / 해제 토글 */
  onToggleAll: () => void;
  /** 선택 해제 */
  onClear: () => void;
  /** 최대 선택 개수 */
  max?: number;
  /** 체크박스 id (페이지 내 중복 방지) */
  id?: string;
  /** 선택 대상 단위 명칭 (예: '가게', '유저') */
  unit?: string;
}

/**
 * 목록 상단의 일괄 선택 툴바
 *
 * - 3-state 체크박스로 전체/부분/미선택 상태를 표시합니다.
 * - 데스크톱에서는 Shift + 클릭 범위 선택 안내를 노출합니다.
 */
const BulkSelectionToolbar: React.FC<BulkSelectionToolbarProps> = ({
                                                                    selectedCount,
                                                                    selectableCount,
                                                                    isAllSelected,
                                                                    isPartiallySelected,
                                                                    onToggleAll,
                                                                    onClear,
                                                                    max,
                                                                    id = 'bulk-select-all',
                                                                    unit = '개'
                                                                  }) => {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // indeterminate는 DOM 속성이라 ref로 직접 설정합니다.
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);

  if (selectableCount === 0) return null;

  return (
    <div className="bulk-select-toolbar">
      <div className="bulk-select-toolbar__main">
        <div className="form-check mb-0">
          <input
            ref={checkboxRef}
            className="form-check-input"
            type="checkbox"
            id={id}
            checked={isAllSelected}
            onChange={onToggleAll}
          />
          <label className="form-check-label small" htmlFor={id}>
            현재 목록 전체 선택
            {max ? ` (최대 ${max}${unit})` : ` (${selectableCount}${unit})`}
          </label>
        </div>

        {selectedCount > 0 && (
          <div className="bulk-select-toolbar__status">
            <span className="page-count">선택 {selectedCount}{unit}</span>
            <button type="button" className="btn btn-sm btn-link p-0" onClick={onClear}>
              선택 해제
            </button>
          </div>
        )}
      </div>

      <div className="bulk-select-toolbar__hint d-none d-md-block">
        <i className="bi bi-info-circle me-1"/>
        <span>
          카드를 클릭한 뒤 <kbd>Shift</kbd> + 클릭하면 그 사이의 항목이 모두 선택됩니다.
        </span>
      </div>
    </div>
  );
};

export default BulkSelectionToolbar;
