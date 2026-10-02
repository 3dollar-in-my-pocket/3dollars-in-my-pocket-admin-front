/**
 * 섹션 설정(config) 유틸
 *
 * 설정 타입과 입력 필드는 섹션 타입별 설정 정의(SECTION_CONFIGS)를 기준으로 구성합니다.
 */

import {
  ScreenSectionLayoutConfig,
  SectionConfigFieldMeta,
  SectionConfigMeta,
  SectionConfigValue,
  SectionType,
  SectionTypeMeta
} from '@/types/screenSectionLayout';
import {getSectionConfigs} from '@/constants/screenSectionLayout';

export const findConfigMeta = (
  sectionType: SectionType,
  configType: string | undefined
): SectionConfigMeta | undefined => getSectionConfigs(sectionType).find((config) => config.type === configType);

/**
 * 설정 타입을 새로 고를 때의 초기값.
 *
 * 필수가 아닌 필드는 서버 기본값(BOOLEAN: false, INTEGER_LIST: 빈 배열)으로 채우고,
 * 필수 숫자 필드는 비워 둡니다. min을 기본값으로 해석하지 않습니다.
 */
export const buildDefaultConfig = (configMeta: SectionConfigMeta): ScreenSectionLayoutConfig => {
  const config: ScreenSectionLayoutConfig = {type: configMeta.type};
  configMeta.fields.forEach((field) => {
    if (field.valueType === 'BOOLEAN') config[field.name] = false;
    if (field.valueType === 'INTEGER_LIST') config[field.name] = [];
  });
  return config;
};

/** 섹션 추가 시 사용할 초기 설정. 메타의 첫 번째 설정 타입을 사용합니다. */
export const buildInitialConfig = (sectionType: SectionType): ScreenSectionLayoutConfig | undefined => {
  const first = getSectionConfigs(sectionType)[0];
  return first ? buildDefaultConfig(first) : undefined;
};

const describeRange = (field: SectionConfigFieldMeta): string => {
  const parts: string[] = [];
  if (field.min !== undefined) parts.push(`${field.min} ${field.isMinExclusive ? '초과' : '이상'}`);
  if (field.max !== undefined) parts.push(`${field.max} 이하`);
  return parts.join(' ');
};

/** 입력 폼에 보여줄 제약 안내. 예: "1 이상 200 이하", "최대 20개" */
export const describeFieldConstraint = (field: SectionConfigFieldMeta): string => {
  const parts: string[] = [];
  const range = describeRange(field);
  if (field.valueType === 'INTEGER_LIST') {
    if (range) parts.push(`각 값 ${range}`);
    if (field.maxItems !== undefined) parts.push(`최대 ${field.maxItems}개`);
    parts.push('중복 불가');
  } else if (range) {
    parts.push(range);
  }
  return parts.join(', ');
};

const isInRange = (value: number, field: SectionConfigFieldMeta): boolean => {
  if (field.min !== undefined) {
    if (field.isMinExclusive ? value <= field.min : value < field.min) return false;
  }
  return field.max === undefined || value <= field.max;
};

/** 필드 하나를 검증하고 오류 메시지를 반환합니다. */
const validateField = (field: SectionConfigFieldMeta, value: unknown): string | undefined => {
  const range = describeRange(field);

  switch (field.valueType) {
    case 'INTEGER':
    case 'DECIMAL': {
      if (value === undefined || value === null) {
        return field.isRequired ? `${field.name} 값을 입력해주세요.` : undefined;
      }
      const isInteger = field.valueType === 'INTEGER';
      if (typeof value !== 'number' || !Number.isFinite(value) || (isInteger && !Number.isInteger(value))) {
        return `${field.name} 값은 ${isInteger ? '정수' : '유한한 숫자'}여야 합니다.`;
      }
      if (!isInRange(value, field)) {
        return `${field.name} 값은 ${range}이어야 합니다.`;
      }
      return undefined;
    }
    case 'BOOLEAN':
      if (value === undefined) {
        return field.isRequired ? `${field.name} 값을 선택해주세요.` : undefined;
      }
      return typeof value === 'boolean' ? undefined : `${field.name} 값이 올바르지 않습니다.`;
    case 'INTEGER_LIST': {
      if (value === undefined) {
        return field.isRequired ? `${field.name} 값을 입력해주세요.` : undefined;
      }
      if (!Array.isArray(value)) return `${field.name} 값이 올바르지 않습니다.`;
      if (field.isRequired && value.length === 0) return `${field.name} 값을 입력해주세요.`;
      if (value.some((item) => typeof item !== 'number' || !Number.isInteger(item))) {
        return `${field.name}에는 정수만 입력할 수 있습니다.`;
      }
      if (range && value.some((item) => !isInRange(item, field))) {
        return `${field.name}의 각 값은 ${range}이어야 합니다.`;
      }
      if (new Set(value).size !== value.length) {
        return `${field.name}에 중복된 값이 있습니다.`;
      }
      if (field.maxItems !== undefined && value.length > field.maxItems) {
        return `${field.name}은(는) 최대 ${field.maxItems}개까지 입력할 수 있습니다.`;
      }
      return undefined;
    }
    default:
      return undefined;
  }
};

/** 설정 검증 오류. field가 있으면 해당 입력란을 강조합니다. */
export interface SectionConfigError {
  field?: string;
  message: string;
}

/** 섹션 설정을 메타데이터 기준으로 검증하고 첫 번째 오류를 반환합니다. */
export const validateSectionConfig = (
  config: ScreenSectionLayoutConfig,
  meta: SectionTypeMeta
): SectionConfigError | undefined => {
  const configMeta = findConfigMeta(meta.value, config.type);
  if (!configMeta) {
    return {message: `${meta.label} 섹션은 ${config.type} 설정을 지원하지 않습니다.`};
  }

  for (const field of configMeta.fields) {
    const message = validateField(field, config[field.name]);
    if (message) return {field: field.name, message};
  }
  return undefined;
};

const formatValue = (value: SectionConfigValue | string | undefined): string => {
  if (value === undefined) return '-';
  if (Array.isArray(value)) return value.length > 0 ? `[${value.join(', ')}]` : '[]';
  return String(value);
};

/** 전/후 비교에 표시할 설정 요약. 예: "AD_MOB (height=100)" */
export const formatSectionConfig = (config?: ScreenSectionLayoutConfig | null): string => {
  if (!config) return '기본값';
  const fields = Object.keys(config)
    .filter((key) => key !== 'type')
    .sort()
    .map((key) => `${key}=${formatValue(config[key])}`);
  return fields.length > 0 ? `${config.type} (${fields.join(', ')})` : config.type;
};

