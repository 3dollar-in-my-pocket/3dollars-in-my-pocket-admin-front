import {Form} from 'react-bootstrap';
import {PolicyValueType} from '@/types/policy';
import {getPolicyValueHelp} from '@/utils/policyValueUtils';

interface PolicyValueInputProps {
  id: string;
  value: string;
  valueType?: PolicyValueType;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}

type DurationUnit = 'days' | 'hours' | 'minutes' | 'seconds';

interface DurationParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

const EMPTY_DURATION: DurationParts = {days: '', hours: '', minutes: '', seconds: ''};

/** Java Duration의 ISO-8601 표현을 관리 화면의 단위별 입력값으로 변환합니다. */
const getDurationParts = (value: string): DurationParts => {
  const match = value.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/);
  if (!match) return EMPTY_DURATION;

  return {days: match[1] || '', hours: match[2] || '', minutes: match[3] || '', seconds: match[4] || ''};
};

const toDurationValue = (parts: DurationParts) => {
  const datePart = parts.days ? `${parts.days}D` : '';
  const timePart = `${parts.hours ? `${parts.hours}H` : ''}${parts.minutes ? `${parts.minutes}M` : ''}`
    + `${parts.seconds ? `${parts.seconds}S` : ''}`;
  return datePart || timePart ? `P${datePart}${timePart ? `T${timePart}` : ''}` : '';
};

/** 서버가 지정한 PolicyValueType에 맞춰 정책 값 입력 방식을 표시합니다. */
const PolicyValueInput = ({id, value, valueType = 'STRING', disabled, autoFocus, onChange}: PolicyValueInputProps) => {
  if (valueType === 'BOOLEAN') {
    const helpText = getPolicyValueHelp(valueType);
    return (
      <>
        <div id={id} className="policy-boolean-chips" role="radiogroup" aria-label="정책 값">
          {[
            {label: 'Y', value: 'true'},
            {label: 'N', value: 'false'}
          ].map(option => (
            <button
              key={option.value}
              type="button"
              className={`form-chip policy-boolean-chips__chip ${value === option.value ? 'policy-boolean-chips__chip--selected' : ''}`}
              role="radio"
              aria-checked={value === option.value}
              autoFocus={autoFocus && (!value ? option.value === 'true' : value === option.value)}
              disabled={disabled}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        {helpText && <Form.Text>{helpText}</Form.Text>}
      </>
    );
  }

  if (valueType === 'DURATION') {
    const parts = getDurationParts(value);
    const updateDuration = (unit: DurationUnit, unitValue: string) => {
      // 음수 기간은 단위별 입력에서 혼동을 주므로 서버 규격에 맞는 0 이상의 값만 받습니다.
      if (unitValue && (!/^\d*(?:\.\d+)?$/.test(unitValue) || (unit !== 'seconds' && unitValue.includes('.')))) return;
      onChange(toDurationValue({...parts, [unit]: unitValue}));
    };

    return (
      <>
        <div id={id} className="policy-duration-inputs" aria-label="기간 값">
          {([
            {unit: 'days', label: '일', step: '1'},
            {unit: 'hours', label: '시간', step: '1'},
            {unit: 'minutes', label: '분', step: '1'},
            {unit: 'seconds', label: '초', step: 'any'}
          ] as const).map(({unit, label, step}) => (
            <div key={unit} className="policy-duration-inputs__field">
              <Form.Control
                type="number"
                min="0"
                step={step}
                value={parts[unit]}
                onChange={event => updateDuration(unit, event.target.value)}
                placeholder="0"
                autoFocus={autoFocus && unit === 'days'}
                disabled={disabled}
                aria-label={label}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <Form.Text>{getPolicyValueHelp(valueType)}</Form.Text>
      </>
    );
  }

  const inputType = valueType === 'INTEGER' || valueType === 'DECIMAL' ? 'number' : 'text';
  const placeholder = '정책 값을 입력하세요';

  return (
    <>
      <Form.Control
        id={id}
        type={inputType}
        step={valueType === 'INTEGER' ? '1' : valueType === 'DECIMAL' ? 'any' : undefined}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <Form.Text>{getPolicyValueHelp(valueType)}</Form.Text>
    </>
  );
};

export default PolicyValueInput;
