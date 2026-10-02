import React, {useEffect, useState} from 'react';
import {
  ScreenSectionLayoutConfig,
  SectionConfigFieldMeta,
  SectionConfigValue,
  SectionType
} from '@/types/screenSectionLayout';
import {getSectionConfigs} from '@/constants/screenSectionLayout';
import {
  buildDefaultConfig,
  describeFieldConstraint,
  findConfigMeta,
  SectionConfigError
} from '@/utils/sectionConfigUtils';

/** 빈 입력은 미입력(undefined)으로, 숫자가 아닌 값은 NaN으로 두어 저장 전 검증에서 걸러지게 합니다. */
const parseNumber = (text: string): number | undefined => {
  const trimmed = text.trim();
  return trimmed ? Number(trimmed) : undefined;
};

/** 쉼표나 공백으로 구분한 정수 목록. 빈 토큰은 무시합니다. */
const parseNumberList = (text: string): number[] =>
  text.split(/[\s,]+/).filter(Boolean).map(Number);

const formatNumber = (value: unknown): string =>
  typeof value === 'number' ? String(value) : '';

const formatNumberList = (value: unknown): string =>
  Array.isArray(value) ? value.join(', ') : '';

interface TextValueInputProps {
  id: string;
  value: unknown;
  parse: (text: string) => SectionConfigValue | undefined;
  format: (value: unknown) => string;
  inputMode: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: SectionConfigValue | undefined) => void;
}

/**
 * 숫자/숫자 목록 입력.
 *
 * "1." 이나 "3, " 처럼 입력 도중의 문자열은 숫자로 바꾸면 사라지므로, 입력 문자열은 따로 들고 있다가
 * 외부에서 값이 바뀐 경우(다시 불러오기, 설정 타입 변경 등)에만 다시 맞춥니다.
 */
const TextValueInput: React.FC<TextValueInputProps> = ({
                                                         id,
                                                         value,
                                                         parse,
                                                         format,
                                                         inputMode,
                                                         placeholder,
                                                         disabled,
                                                         invalid,
                                                         onChange
                                                       }) => {
  const [text, setText] = useState(() => format(value));

  useEffect(() => {
    if (format(parse(text)) !== format(value)) {
      setText(format(value));
    }
    // 입력 중인 문자열(text)이 바뀔 때는 동기화하지 않습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      id={id}
      type="text"
      inputMode={inputMode}
      className={`form-control form-control-sm ${invalid ? 'is-invalid' : ''}`}
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        setText(event.target.value);
        onChange(parse(event.target.value));
      }}
    />
  );
};

interface ConfigFieldInputProps {
  id: string;
  field: SectionConfigFieldMeta;
  value: unknown;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: SectionConfigValue | undefined) => void;
}

const ConfigFieldInput: React.FC<ConfigFieldInputProps> = ({id, field, value, disabled, invalid, onChange}) => {
  switch (field.valueType) {
    case 'BOOLEAN':
      return (
        <div className="form-check form-switch mb-0">
          <input
            id={id}
            className="form-check-input"
            type="checkbox"
            role="switch"
            checked={value === true}
            disabled={disabled}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => onChange(event.target.checked)}
          />
          <label className="form-check-label small" htmlFor={id}>
            {value === true ? '사용' : '사용 안 함'}
          </label>
        </div>
      );
    case 'INTEGER':
    case 'DECIMAL':
      return (
        <TextValueInput
          id={id}
          value={value}
          parse={parseNumber}
          format={formatNumber}
          inputMode={field.valueType === 'INTEGER' ? 'numeric' : 'decimal'}
          disabled={disabled}
          invalid={invalid}
          onChange={onChange}
        />
      );
    case 'INTEGER_LIST':
      return (
        <TextValueInput
          id={id}
          value={value}
          parse={parseNumberList}
          format={formatNumberList}
          inputMode="numeric"
          placeholder="예: 3, 8"
          disabled={disabled}
          invalid={invalid}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
};

interface SectionConfigEditorProps {
  sectionKey: string;
  sectionType: SectionType;
  /** 스크린리더 안내용 섹션 표시명 */
  label: string;
  config?: ScreenSectionLayoutConfig | null;
  error?: SectionConfigError;
  editable: boolean;
  onChange: (config: ScreenSectionLayoutConfig) => void;
}

/**
 * 섹션 설정 입력 폼.
 *
 * 섹션 타입별 설정 정의(SECTION_CONFIGS)로 설정 타입을 고르고, 선택한 타입의 fields로 입력란을 구성합니다.
 * 고를 설정 타입이 하나뿐이고 입력 필드도 없으면(EMPTY) 아무것도 그리지 않습니다.
 */
const SectionConfigEditor: React.FC<SectionConfigEditorProps> = ({
                                                                   sectionKey,
                                                                   sectionType,
                                                                   label,
                                                                   config,
                                                                   error,
                                                                   editable,
                                                                   onChange
                                                                 }) => {
  const configs = getSectionConfigs(sectionType);
  const selectedType = config?.type ?? configs[0]?.type;
  const configMeta = findConfigMeta(sectionType, selectedType);
  const hasFields = (configMeta?.fields.length ?? 0) > 0;

  if (configs.length === 0 || (configs.length === 1 && configMeta && !hasFields && !error)) {
    return null;
  }

  // 알 수 없는 설정 타입이 저장되어 있으면 잘못된 값을 만들지 않도록 편집을 막고 서버 값을 그대로 유지합니다.
  const isUnsupported = !configMeta;
  const disabled = !editable || isUnsupported;

  return (
    <div className="section-row__field section-config" onClick={(event) => event.stopPropagation()}>
      <span className="item-card__label">설정</span>

      {configs.length > 1 && (
        <select
          className="form-select form-select-sm section-config__type"
          value={selectedType}
          disabled={!editable}
          aria-label={`${label} 섹션 설정 타입`}
          onChange={(event) => {
            const next = findConfigMeta(sectionType, event.target.value);
            if (next) onChange(buildDefaultConfig(next));
          }}
        >
          {!configMeta && selectedType && <option value={selectedType}>{selectedType}</option>}
          {configs.map((option) => (
            <option key={option.type} value={option.type}>
              {option.fields.length > 0 ? option.type : `${option.type} (추가 설정 없음)`}
            </option>
          ))}
        </select>
      )}

      {isUnsupported && (
        <div className="small text-warning-emphasis">
          <i className="bi bi-exclamation-triangle me-1"/>
          어드민에서 아직 지원하지 않는 설정이 포함되어 있어 편집할 수 없습니다. 저장 시 기존 값이 그대로 유지됩니다.
        </div>
      )}

      {configMeta && !isUnsupported && hasFields && (
        <div className="section-config__fields">
          {configMeta.fields.map((field) => {
            const id = `config-${sectionKey}-${field.name}`;
            const constraint = describeFieldConstraint(field);
            return (
              <div key={field.name} className="section-config__field">
                <label className="small font-monospace" htmlFor={id}>
                  {field.name}
                  {field.isRequired && <span className="text-danger ms-1">*</span>}
                </label>
                <ConfigFieldInput
                  id={id}
                  field={field}
                  value={config?.[field.name]}
                  disabled={disabled}
                  invalid={error?.field === field.name}
                  onChange={(value) => onChange({
                    ...(config ?? {type: configMeta.type}),
                    type: configMeta.type,
                    [field.name]: value,
                  })}
                />
                {(constraint || field.description) && (
                  <span className="form-text">
                    {[constraint, field.description].filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
};

export default SectionConfigEditor;
