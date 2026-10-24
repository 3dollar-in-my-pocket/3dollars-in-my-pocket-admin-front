import React from 'react';
import {SectionVisibilityCondition, SectionVisibilityConditionType} from '@/types/screenSectionLayout';

/** 노출 조건의 기준으로 고를 수 있는 같은 화면의 다른 섹션 */
export interface VisibilityConditionCandidate {
  sectionId: string;
  label: string;
  isVisible: boolean;
}

const CONDITION_TYPE_OPTIONS: { value: SectionVisibilityConditionType; label: string; description: string }[] = [
  {
    value: 'EXPOSED',
    label: '기준 섹션이 노출될 때만',
    description: '선택한 섹션 중 하나라도 화면에 노출되면 이 섹션을 노출합니다.',
  },
  {
    value: 'NOT_EXPOSED',
    label: '기준 섹션이 노출되지 않을 때만',
    description: '선택한 섹션이 모두 노출되지 않을 때만 이 섹션을 노출합니다.',
  },
];

interface SectionVisibilityConditionEditorProps {
  sectionKey: string;
  /** 스크린리더 안내용 섹션 표시명 */
  label: string;
  condition: SectionVisibilityCondition | null;
  candidates: VisibilityConditionCandidate[];
  error?: string;
  editable: boolean;
  onChange: (condition: SectionVisibilityCondition | null) => void;
}

/**
 * 섹션 노출 조건 입력.
 *
 * "노출"은 레이아웃에 켜져 있는지가 아니라 실제로 화면에 내려갔는지 기준입니다.
 * 데이터가 없어 빠진 섹션(광고 0건 등)과 미노출(isVisible=false) 섹션은 노출되지 않은 것으로 봅니다.
 */
const SectionVisibilityConditionEditor: React.FC<SectionVisibilityConditionEditorProps> = ({
                                                                                             sectionKey,
                                                                                             label,
                                                                                             condition,
                                                                                             candidates,
                                                                                             error,
                                                                                             editable,
                                                                                             onChange
                                                                                           }) => {
  const selectId = `condition-type-${sectionKey}`;
  const selectedIds = condition?.sectionIds ?? [];
  const typeOption = CONDITION_TYPE_OPTIONS.find((option) => option.value === condition?.type);

  // 저장된 조건이 지워졌거나 식별자가 바뀐 섹션을 가리키면, 선택 해제할 수 있도록 그대로 보여줍니다.
  const unknownIds = selectedIds.filter((id) => !candidates.some((candidate) => candidate.sectionId === id));
  const hiddenSelected = candidates.filter((candidate) => !candidate.isVisible && selectedIds.includes(candidate.sectionId));
  const isAlwaysHidden = condition?.type === 'EXPOSED'
    && selectedIds.length > 0
    && hiddenSelected.length === selectedIds.length;

  const toggle = (sectionId: string) => {
    if (!condition) return;
    onChange({
      ...condition,
      sectionIds: selectedIds.includes(sectionId)
        ? selectedIds.filter((id) => id !== sectionId)
        : [...selectedIds, sectionId],
    });
  };

  return (
    <div className="section-row__field section-condition" onClick={(event) => event.stopPropagation()}>
      <label className="item-card__label" htmlFor={selectId}>노출 조건</label>
      <select
        id={selectId}
        className={`form-select form-select-sm section-condition__type ${error ? 'is-invalid' : ''}`}
        value={condition?.type ?? ''}
        disabled={!editable}
        aria-label={`${label} 섹션 노출 조건`}
        onChange={(event) => {
          const type = event.target.value as SectionVisibilityConditionType | '';
          onChange(type ? {type, sectionIds: selectedIds} : null);
        }}
      >
        <option value="">조건 없음 (항상 노출)</option>
        {CONDITION_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      {condition && (
        <>
          <span className="form-text">{typeOption?.description}</span>
          {candidates.length === 0 && unknownIds.length === 0 ? (
            <span className="form-text">기준으로 선택할 수 있는 다른 섹션이 없습니다.</span>
          ) : (
            <div className="section-config__presets" role="group" aria-label={`${label} 섹션 노출 조건 기준 섹션`}>
              {candidates.map((candidate) => {
                const isSelected = selectedIds.includes(candidate.sectionId);
                return (
                  <button
                    key={candidate.sectionId}
                    type="button"
                    className={`margin-picker__chip ${isSelected ? 'is-selected' : ''}`}
                    title={candidate.isVisible ? candidate.label : `${candidate.label} (미노출)`}
                    disabled={!editable}
                    aria-pressed={isSelected}
                    onClick={() => toggle(candidate.sectionId)}
                  >
                    {!candidate.isVisible && <i className="bi bi-eye-slash me-1" aria-label="미노출"/>}
                    <span className="font-monospace">{candidate.sectionId}</span>
                  </button>
                );
              })}
              {unknownIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  className="margin-picker__chip is-selected"
                  title="목록에 없는 섹션입니다. 눌러서 선택을 해제하세요."
                  disabled={!editable}
                  aria-pressed
                  onClick={() => toggle(id)}
                >
                  <i className="bi bi-exclamation-triangle me-1" aria-label="목록에 없음"/>
                  <span className="font-monospace">{id}</span>
                </button>
              ))}
            </div>
          )}
          {isAlwaysHidden && (
            <span className="form-text text-warning-emphasis">
              <i className="bi bi-exclamation-triangle me-1"/>
              기준 섹션이 모두 미노출 상태라 이 섹션은 항상 노출되지 않습니다.
            </span>
          )}
        </>
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default SectionVisibilityConditionEditor;
