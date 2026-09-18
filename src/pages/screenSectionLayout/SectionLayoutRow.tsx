import React, {DragEvent, useEffect, useRef, useState} from 'react';
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

/** 앱에서 실제로 자주 쓰이는 여백 값. 매번 숫자를 타이핑하지 않도록 칩으로 제공합니다. */
const MARGIN_PRESETS = [0, 8, 16, 24, 32];

/** 미리보기에서 해당 편집 행으로 스크롤할 때 쓰는 DOM id */
export const sectionRowId = (key: string): string => `section-row-${key}`;

interface SectionLayoutRowProps {
  section: SectionLayoutDraft;
  index: number;
  meta?: SectionTypeMeta;
  error?: string;
  /** 편집 권한이 없으면 드래그/입력을 모두 잠급니다. */
  editable: boolean;
  isDragging: boolean;
  /** 미리보기에서 선택된 행. 양쪽을 같이 강조해 어느 블록인지 연결해줍니다. */
  isActive: boolean;
  dropPosition?: 'before' | 'after';
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  /** 목록이 길 때 여러 번 누르지 않고 한 번에 옮기기 위한 이동 */
  onMoveToTop: () => void;
  onMoveToBottom: () => void;
  onChange: (changes: Partial<SectionLayoutDraft>) => void;
  onRemove: () => void;
  onSelect: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  /** 전체 섹션 수. 스크린리더에 "3번째 / 총 8개"로 안내합니다. */
  totalCount: number;
}

/** 드래그 정렬이 가능한 섹션 한 줄 */
const SectionLayoutRow: React.FC<SectionLayoutRowProps> = ({
                                                             section,
                                                             index,
                                                             meta,
                                                             error,
                                                             editable,
                                                             isDragging,
                                                             isActive,
                                                             dropPosition,
                                                             onDragStart,
                                                             onDragEnd,
                                                             onDragOver,
                                                             onDragLeave,
                                                             onDrop,
                                                             onMoveUp,
                                                             onMoveDown,
                                                             onMoveToTop,
                                                             onMoveToBottom,
                                                             onChange,
                                                             onRemove,
                                                             onSelect,
                                                             canMoveUp,
                                                             canMoveDown,
                                                             totalCount
                                                           }) => {
  const isRequired = meta?.isRequired ?? false;
  const label = meta?.label ?? section.sectionType;
  const handleRef = useRef<HTMLSpanElement>(null);
  // 방향키로 순서를 바꾸면 행이 통째로 옮겨져 포커스가 사라지므로 직접 되돌려줍니다.
  const shouldRefocusHandle = useRef(false);

  /**
   * sectionId 입력란 노출 여부.
   *
   * 대부분 추가 시 자동 생성된 기본값을 그대로 쓰므로 평소에는 접어두고,
   * 오류가 있을 때만 강제로 펼쳐 무엇을 고쳐야 하는지 바로 보이게 합니다.
   */
  const [showSectionId, setShowSectionId] = useState(false);
  const isSectionIdOpen = showSectionId || Boolean(error);

  useEffect(() => {
    if (!shouldRefocusHandle.current) return;
    shouldRefocusHandle.current = false;
    handleRef.current?.focus();
  }, [index]);

  const rowClassName = [
    'section-row',
    section.isVisible ? '' : 'section-row--hidden',
    isActive ? 'section-row--active' : '',
    isDragging ? 'section-row--dragging' : '',
    dropPosition === 'before' ? 'section-row--drop-before' : '',
    dropPosition === 'after' ? 'section-row--drop-after' : '',
    error ? 'section-row--invalid' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      id={sectionRowId(section.key)}
      className={rowClassName}
      draggable={editable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onSelect}
    >
      {/*
        순서 핸들. 마우스 드래그와 방향키로 순서를 바꿉니다.
        터치 환경에서는 HTML5 드래그가 동작하지 않아 아래 이동 버튼이 유일한 수단입니다.
      */}
      <div className="section-row__handle-col">
        <span
          ref={handleRef}
          className="section-handle"
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : -1}
          aria-label={`${label} 섹션 순서 변경. 위/아래 방향키로 이동합니다. 총 ${totalCount}개 중 ${index + 1}번째`}
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
          <i className="bi bi-grip-vertical" aria-hidden="true"/>
        </span>
        <span className="section-row__order">
          {index + 1}
          <span className="section-row__order-total">/{totalCount}</span>
        </span>
      </div>

      <div className="section-row__main">
        <div className="section-row__title-line">
          <span className="section-row__name">{label}</span>
          {isRequired && <span className="section-chip section-chip--required">필수</span>}
          {meta?.allowsMultiple && <span className="section-chip">중복 가능</span>}
          {!section.isVisible && (
            <span className="section-chip section-chip--hidden">
              <i className="bi bi-eye-slash"/>미노출
            </span>
          )}

          <button
            type="button"
            className="section-row__id-toggle"
            onClick={(event) => {
              event.stopPropagation();
              setShowSectionId((prev) => !prev);
            }}
            aria-expanded={isSectionIdOpen}
            title="섹션 식별자 보기 / 수정"
          >
            <span className="font-monospace">{section.sectionId || '(비어 있음)'}</span>
            <i className={`bi ${isSectionIdOpen ? 'bi-chevron-up' : 'bi-pencil'}`}/>
          </button>
        </div>

        {isSectionIdOpen && (
          <div className="section-row__id-edit">
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
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => onChange({sectionId: event.target.value})}
            />
            {error && <div className="invalid-feedback d-block">{error}</div>}
          </div>
        )}

        <div className="section-row__controls">
          {/* 하단 여백: 자주 쓰는 값은 칩으로, 그 외 값은 직접 입력으로 다룹니다. */}
          <div className="section-row__field">
            <span className="item-card__label">하단 여백</span>
            <div className="margin-picker" role="group" aria-label={`${label} 섹션 하단 여백`}>
              {MARGIN_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`margin-picker__chip ${section.marginBottom === preset ? 'is-selected' : ''}`}
                  disabled={!editable}
                  aria-pressed={section.marginBottom === preset}
                  onClick={(event) => {
                    event.stopPropagation();
                    onChange({marginBottom: preset});
                  }}
                >
                  {preset}
                </button>
              ))}
              <input
                type="number"
                className="margin-picker__input form-control form-control-sm"
                value={section.marginBottom}
                min={MARGIN_BOTTOM_MIN}
                max={MARGIN_BOTTOM_MAX}
                disabled={!editable}
                aria-label={`${label} 섹션 하단 여백 직접 입력`}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onChange({marginBottom: parseMarginBottom(event.target.value)})}
              />
            </div>
          </div>

          <div className="section-row__field section-row__field--visible">
            <span className="item-card__label">노출</span>
            <div className="form-check form-switch mb-0">
              <input
                id={`visible-${section.key}`}
                className="form-check-input"
                type="checkbox"
                role="switch"
                checked={section.isVisible}
                /* 필수 섹션은 미노출로 보내면 서버가 400을 반환하므로 토글을 잠급니다. */
                disabled={!editable || isRequired}
                title={isRequired ? '필수 섹션은 항상 노출됩니다.' : undefined}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => onChange({isVisible: event.target.checked})}
              />
              <label className="form-check-label small" htmlFor={`visible-${section.key}`}>
                {section.isVisible ? '노출' : '미노출'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/*
        순서 이동 / 삭제.
        터치 환경에서는 드래그를 쓸 수 없어 이 버튼들이 순서 변경의 유일한 수단이므로,
        목록이 길 때를 대비해 맨 위/맨 아래로 한 번에 보내는 버튼도 함께 둡니다.
      */}
      <div className="section-row__actions">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary section-row__move section-row__move--edge"
          disabled={!editable || !canMoveUp}
          onClick={(event) => {
            event.stopPropagation();
            onMoveToTop();
          }}
          aria-label={`${label} 섹션 맨 위로 이동`}
          title="맨 위로"
        >
          <i className="bi bi-chevron-double-up"/>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary section-row__move"
          disabled={!editable || !canMoveUp}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
          aria-label={`${label} 섹션 위로 이동`}
          title="위로"
        >
          <i className="bi bi-arrow-up"/>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary section-row__move"
          disabled={!editable || !canMoveDown}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
          aria-label={`${label} 섹션 아래로 이동`}
          title="아래로"
        >
          <i className="bi bi-arrow-down"/>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary section-row__move section-row__move--edge"
          disabled={!editable || !canMoveDown}
          onClick={(event) => {
            event.stopPropagation();
            onMoveToBottom();
          }}
          aria-label={`${label} 섹션 맨 아래로 이동`}
          title="맨 아래로"
        >
          <i className="bi bi-chevron-double-down"/>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger section-row__move section-row__move--remove"
          /* 필수 섹션은 목록에서 빼면 서버가 400을 반환합니다. */
          disabled={!editable || isRequired}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
          aria-label={`${label} 섹션 삭제`}
          title={isRequired ? '필수 섹션은 삭제할 수 없습니다.' : '섹션 삭제'}
        >
          <i className="bi bi-trash"/>
        </button>
      </div>
    </div>
  );
};

export default SectionLayoutRow;
