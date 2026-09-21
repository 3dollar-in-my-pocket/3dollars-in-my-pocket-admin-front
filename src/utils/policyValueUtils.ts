import {PolicyValueType} from '@/types/policy';

export const POLICY_VALUE_TYPE_LABEL: Record<PolicyValueType, string> = {
  STRING: '문자열',
  BOOLEAN: '참/거짓',
  INTEGER: '정수',
  DECIMAL: '소수',
  DURATION: '기간'
};

export const getPolicyValueHelp = (valueType?: PolicyValueType) => {
  switch (valueType) {
    case 'BOOLEAN': return '';
    case 'INTEGER': return '정수만 입력할 수 있습니다.';
    case 'DECIMAL': return '유한한 숫자만 입력할 수 있습니다.';
    case 'DURATION': return '일, 시간, 분, 초 단위로 입력하세요.';
    default: return '정책에 적용할 값을 입력하세요.';
  }
};

export const isValidPolicyValue = (value: string, valueType?: PolicyValueType) => {
  if (!value.trim()) return false;

  switch (valueType) {
    case 'BOOLEAN': return value === 'true' || value === 'false';
    case 'INTEGER': return /^[-+]?\d+$/.test(value);
    case 'DECIMAL': return Number.isFinite(Number(value));
    // java.time.Duration.parse()가 사용하는 ISO-8601 duration 형식
    case 'DURATION': return /^[-+]?P(?=\d|T\d)(?:\d+D)?(?:T(?=\d)(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?$/.test(value);
    default: return true;
  }
};
