import React, {DragEvent, useEffect, useRef} from 'react';
import {
  MARGIN_BOTTOM_MAX,
  MARGIN_BOTTOM_MIN,
  SECTION_ID_MAX_LENGTH,
  SectionTypeMeta
} from '@/types/screenSectionLayout';
import {SectionLayoutDraft} from './useSectionLayoutDraft';

/** 빈 입력이나 숫자가 아닌 값은 0으로 처리합니다. 범위 검증은 저장 단계에서 별도로 수행합니다. */
const parseMarginBottom = (value: string): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

interface SectionLayoutRowProps {
  section: SectionLayoutDraft;
  index: number;
  meta?: SectionTypeMeta;
  error?: string;
  /** 편집 권한이 없으면 드래그/입력을 모두 잠급니다. */
  editable: boolean;
  isDragging: boolean;
  dropPosition?: 'before' | 'after';
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChange: (changes: Partial<SectionLayoutDraft>) => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

/** 드래그 정렬이 가능한 섹션 한 줄 */
const SectionLayoutRow: React.FC<SectionLayoutRowProps> = ({
                                                             section,
                                                             index,
                                                             meta,
                                                             error,
                                                             editable,
                                                             isDragging,
                                                             dropPosition,
                                                             onDragStart,
                                                             onDragEnd,
                                                             onDragOver,
                                                             onDragLeave,
                                                             onDrop,
                                                             onMoveUp,
                                                             onMoveDown,
                                                             onChange,
                                                             onRemove,
                                                             canMoveUp,
                                                             canMoveDown
                                                           }) => {
  const isRequired = meta?.isRequired ?? false;
  const label = meta?.label ?? section.sectionType;
  const handleRef = useRef<HTMLSpanElement>(null);
  // 방향키로 순서를 바꾸면 행이 통째로 옮겨져 포커스가 사라지므로 직접 되돌려줍니다.
  const shouldRefocusHandle = useRef(false);

  useEffect(() => {
    if (!shouldRefocusHandle.current) return;
    shouldRefocusHandle.current = false;
    handleRef.current?.focus();
  }, [index]);

  return (
    <div
      className={`item-card ${section.isVisible ? '' : 'item-card--muted'}`}
      draggable={editable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        opacity: isDragging ? 0.45 : 1,
        boxShadow: dropPosition === 'before'
          ? 'inset 0 4px 0 var(--bs-primary)'
          : dropPosition === 'after'
            ? 'inset 0 -4px 0 var(--bs-primary)'
            : undefined,
        cursor: editable ? 'grab' : 'default',
        transition: 'box-shadow 120ms ease, opacity 120ms ease'
      }}
    >
      <div className="item-card__body">
        <div className="d-flex align-items-start gap-2 gap-md-3 flex-wrap flex-md-nowrap">
          {/* 순서 핸들. 마우스 드래그 외에 방향키로도 순서를 바꿀 수 있습니다. */}
          <div className="d-flex align-items-center gap-2 text-body-secondary flex-shrink-0">
            <span
              ref={handleRef}
              className="section-handle"
              role={editable ? 'button' : undefined}
              tabIndex={editable ? 0 : -1}
              aria-label={`${label} 섹션 순서 변경. 위/아래 방향키로 이동합니다. 현재 ${index + 1}번째`}
              title={editable ? '드래그하거나 위/아래 방향키로 순서를 바꿉니다' : undefined}
              onKeyDown={(event) => {
                if (!editable) return;
                if (event.key === 'ArrowUp' && canMoveUp) {
                  event.preventDefault();
                  shouldRefocusHandle.current = true;
                  onMoveUp();
                } else if (event.key === 'ArrowDown' && canMoveDown) {
                  event.preventDefault();
                  shouldRefocusHandle.current = true;
                  onMoveDown();
                }
              }}
            >
              <i className="bi bi-grip-vertical fs-5" aria-hidden="true"/>
            </span>
            <span className="badge text-bg-light border">{index + 1}</span>
          </div>

          {/* 섹션 정보 */}
          <div className="flex-grow-1 min-w-0">
            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
              <span className="fw-semibold">{label}</span>
              <span className="badge text-bg-light border font-monospace">{section.sectionType}</span>
              {isRequired && <span className="badge text-bg-primary rounded-pill">필수</span>}
              {meta?.allowsMultiple && (
                <span className="badge text-bg-light border rounded-pill">중복 등록 가능</span>
              )}
              {!section.isVisible && (
                <span className="badge text-bg-secondary rounded-pill">
                  <i className="bi bi-eye-slash me-1"/>미노출
                </span>
              )}
            </div>

            <div className="row g-2">
              <div className="col-12 col-sm-7">
                <label className="item-card__label" htmlFor={`section-id-${section.key}`}>
                  섹션 식별자 (sectionId)
                </label>
                <input
                  id={`section-id-${section.key}`}
                  type="text"
                  className={`form-control form-control-sm font-monospace ${error ? 'is-invalid' : ''}`}
                  value={section.sectionId}
                  maxLength={SECTION_ID_MAX_LENGTH}
                  disabled={!editable}
                  onChange={(event) => onChange({sectionId: event.target.value})}
                />
              </div>

              <div className="col-6 col-sm-3">
                <label className="item-card__label" htmlFor={`margin-bottom-${section.key}`}>
                  하단 여백
                </label>
                <input
                  id={`margin-bottom-${section.key}`}
                  type="number"
                  className="form-control form-control-sm"
                  value={section.marginBottom}
                  min={MARGIN_BOTTOM_MIN}
                  max={MARGIN_BOTTOM_MAX}
                  disabled={!editable}
                  onChange={(event) => onChange({marginBottom: parseMarginBottom(event.target.value)})}
                />
              </div>

              <div className="col-6 col-sm-2 d-flex align-items-end">
                <div className="form-check form-switch mb-1">
                  <input
                    id={`visible-${section.key}`}
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={section.isVisible}
                    /* 필수 섹션은 미노출로 보내면 서버가 400을 반환하므로 토글을 잠급니다. */
                    disabled={!editable || isRequired}
                    onChange={(event) => onChange({isVisible: event.target.checked})}
                  />
                  <label className="form-check-label small" htmlFor={`visible-${section.key}`}>
                    노출
                  </label>
                </div>
              </div>
            </div>

            {error && <div className="text-danger small mt-1">{error}</div>}
          </div>

          {/* 순서 이동 / 삭제 */}
          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={!editable || !canMoveUp}
              onClick={onMoveUp}
              aria-label={`${label} 섹션 위로 이동`}
            >
              <i className="bi bi-arrow-up"/>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={!editable || !canMoveDown}
              onClick={onMoveDown}
              aria-label={`${label} 섹션 아래로 이동`}
            >
              <i className="bi bi-arrow-down"/>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              /* 필수 섹션은 목록에서 빼면 서버가 400을 반환합니다. */
              disabled={!editable || isRequired}
              onClick={onRemove}
              aria-label={`${label} 섹션 삭제`}
              title={isRequired ? '필수 섹션은 삭제할 수 없습니다.' : '섹션 삭제'}
            >
              <i className="bi bi-trash"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionLayoutRow;
