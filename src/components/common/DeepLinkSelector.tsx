import React, {useEffect, useState} from 'react';
import {Form, Badge} from 'react-bootstrap';
import applicationApi, {AppScheme} from '../../api/applicationApi';

interface DeepLinkSelectorProps {
  value: string;
  onChange: (value: string) => void;
  applicationType?: 'USER' | 'BOSS';
  label?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  className?: string;
}

const DeepLinkSelector: React.FC<DeepLinkSelectorProps> = ({
                                                             value,
                                                             onChange,
                                                             applicationType = 'USER',
                                                             label = '이동 경로',
                                                             required = false,
                                                             placeholder = '/home, /event 등',
                                                             helpText,
                                                             className = ''
                                                           }) => {
  const [schemes, setSchemes] = useState<AppScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>('');
  const [schemeParams, setSchemeParams] = useState<Record<string, string>>({});
  const [isCustomPath, setIsCustomPath] = useState<boolean>(false);

  // 스킴 목록 로드
  useEffect(() => {
    const loadSchemes = async () => {
      const response = await applicationApi.getSchemes(applicationType);
      if (response.ok) {
        setSchemes(response.data.contents);
      }
    };
    loadSchemes();

    // applicationType이 변경되면 선택된 스킴 초기화
    setSelectedScheme('');
    setSchemeParams({});
    setIsCustomPath(false);
    onChange('');
  }, [applicationType]);

  // 선택된 스킴에서 플레이스홀더 추출
  const extractPlaceholders = (path: string): string[] => {
    const matches = path.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '')) : [];
  };

  // 스킴 선택 핸들러
  const handleSchemeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const schemeValue = e.target.value;

    if (schemeValue === 'custom') {
      setIsCustomPath(true);
      setSelectedScheme('');
      setSchemeParams({});
      onChange('');
    } else if (schemeValue === '') {
      setIsCustomPath(false);
      setSelectedScheme('');
      setSchemeParams({});
      onChange('');
    } else {
      setIsCustomPath(false);
      setSelectedScheme(schemeValue);
      const placeholders = extractPlaceholders(schemeValue);
      const newParams: Record<string, string> = {};
      placeholders.forEach(p => newParams[p] = '');
      setSchemeParams(newParams);

      // 플레이스홀더가 없으면 바로 경로 설정
      if (placeholders.length === 0) {
        onChange(schemeValue);
      } else {
        onChange('');
      }
    }
  };

  // 파라미터 입력 핸들러
  const handleParamChange = (param: string, paramValue: string) => {
    const newParams = {...schemeParams, [param]: paramValue};
    setSchemeParams(newParams);

    // 모든 파라미터가 입력되었는지 확인
    const allFilled = Object.values(newParams).every(v => v.trim() !== '');
    if (allFilled) {
      // 플레이스홀더를 실제 값으로 치환
      let finalPath = selectedScheme;
      Object.entries(newParams).forEach(([key, val]) => {
        finalPath = finalPath.replace(`{{${key}}}`, val);
      });
      onChange(finalPath);
    } else {
      onChange('');
    }
  };

  return (
    <div className={className}>
      {label && (
        <Form.Label className="fw-semibold d-flex align-items-center">
          <i className="bi bi-link-45deg text-success me-2"></i>
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </Form.Label>
      )}

      {/* 스킴 선택 드롭다운 */}
      <Form.Select
        value={isCustomPath ? 'custom' : selectedScheme}
        onChange={handleSchemeSelect}
        className="border-2 mb-2"
      >
        <option value="">경로를 선택하세요</option>
        <option value="custom">✏️ 직접 입력</option>
        {schemes.map((scheme, index) => (
          <option key={index} value={scheme.path}>
            {scheme.description}
          </option>
        ))}
      </Form.Select>

      {/* 선택된 스킴 정보 표시 */}
      {selectedScheme && !isCustomPath && (
        <div className="bg-info-subtle border border-info rounded p-2 mb-2">
          <small className="text-info fw-medium">
            <i className="bi bi-code-square me-1"></i>
            스킴:
          </small>
          <code className="ms-2 text-info">{selectedScheme}</code>
        </div>
      )}

      {/* 선택된 스킴에 플레이스홀더가 있는 경우 */}
      {selectedScheme && Object.keys(schemeParams).length > 0 && (
        <div className="border rounded p-3 bg-light mb-2">
          <div className="small fw-semibold text-secondary mb-2">
            <i className="bi bi-gear me-1"></i>
            파라미터 입력 (필수)
          </div>
          {Object.keys(schemeParams).map((param) => (
            <Form.Group key={param} className="mb-2">
              <Form.Label className="small mb-1">
                <Badge bg="secondary" className="me-1">{param}</Badge>
                {param === 'storeType' && (
                  <span className="text-muted ms-1" style={{fontSize: '0.75rem'}}>가게 유형</span>
                )}
              </Form.Label>

              {/* storeType인 경우 선택 드롭다운 */}
              {param === 'storeType' ? (
                <Form.Select
                  size="sm"
                  value={schemeParams[param]}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                  className="border-2"
                >
                  <option value="">가게 유형을 선택하세요</option>
                  <option value="USER_STORE">🏪 유저 가게</option>
                  <option value="BOSS_STORE">👔 사장님 가게</option>
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder={`${param} 값을 입력하세요`}
                  value={schemeParams[param]}
                  onChange={(e) => handleParamChange(param, e.target.value)}
                />
              )}
            </Form.Group>
          ))}
        </div>
      )}

      {/* 직접 입력 모드 */}
      {isCustomPath && (
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-2 mb-2"
        />
      )}

      {/* 최종 경로 미리보기 */}
      {value && (
        <div className="bg-success-subtle border border-success rounded p-2 mb-2">
          <small className="text-success fw-medium">
            <i className="bi bi-check-circle-fill me-1"></i>
            최종 경로:
          </small>
          <code className="ms-2 text-success">{value}</code>
        </div>
      )}

      {/* 도움말 텍스트 */}
      {helpText && (
        <Form.Text className="text-muted small">
          {!value && required && <span className="text-danger">* 필수 항목: </span>}
          {helpText}
        </Form.Text>
      )}
    </div>
  );
};

export default DeepLinkSelector;
