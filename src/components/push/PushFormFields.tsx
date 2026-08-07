import {getOsPlatformDisplayName} from '../../utils/display/deviceDisplay';
import {useEffect, useState} from 'react';
import {Form, Nav, Tab, Button, Badge, InputGroup} from 'react-bootstrap';
import {PUSH_OS_PLATFORM} from '../../types/device';
import UserSearch, {PushSearchUser, PushSelectedUser} from './UserSearch';
import applicationApi, {AppScheme} from '../../api/applicationApi';
import {PushOsPlatform} from '../../types/device';

interface PushFormFieldsProps {
  formData: {
    pushType: string;
    targetType: string;
    accountIdsInput: string;
    title: string;
    body: string;
    path: string;
    imageUrl: string;
  };
  searchState: {
    nicknameSearch: string;
    searchResults: PushSearchUser[];
    searchLoading: boolean;
  };
  selectedUsers: PushSelectedUser[];
  uiState: {
    uploading: boolean;
    loading?: boolean;
  };
  targetOsPlatforms: Set<PushOsPlatform>;
  /** formData의 키와 값. 필드마다 값 타입이 달라 value는 any */
  updateFormData: (field: string, value: any) => void;
  updateNicknameSearch: (value: string) => void;
  searchUserByNickname: () => void;
  handleAddUser: (userId: string, nickname: string) => void;
  handleRemoveUser: (userId: string) => void;
  isUserSelected: (userId: string) => boolean;
  uploadImage: (file: File) => void;
  removeImage: () => void;
  toggleOsPlatform: (platform: PushOsPlatform) => void;
}

const PushFormFields = ({
                          formData,
                          searchState,
                          selectedUsers,
                          uiState,
                          targetOsPlatforms,
                          updateFormData,
                          updateNicknameSearch,
                          searchUserByNickname,
                          handleAddUser,
                          handleRemoveUser,
                          isUserSelected,
                          uploadImage,
                          removeImage,
                          toggleOsPlatform
                        }: PushFormFieldsProps) => {
  const [schemes, setSchemes] = useState<AppScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>('');
  const [schemeParams, setSchemeParams] = useState<Record<string, string>>({});
  const [isCustomPath, setIsCustomPath] = useState<boolean>(false);

  // 스킴 목록 로드 - targetType에 따라 다른 API 호출
  useEffect(() => {
    const loadSchemes = async () => {
      // targetType에 따라 API 타입 결정
      const apiType = formData.targetType === 'USER' ? 'USER' : 'BOSS';
      const response = await applicationApi.getSchemes(apiType);
      if (response.ok) {
        setSchemes(response.data.contents);
      }
    };
    loadSchemes();

    // targetType이 변경되면 선택된 스킴 초기화
    setSelectedScheme('');
    setSchemeParams({});
    setIsCustomPath(false);
    updateFormData('path', '');
  }, [formData.targetType]);

  // 선택된 스킴에서 플레이스홀더 추출
  const extractPlaceholders = (path: string): string[] => {
    const matches = path.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '')) : [];
  };

  // 스킴 선택 핸들러
  const handleSchemeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    if (value === 'custom') {
      setIsCustomPath(true);
      setSelectedScheme('');
      setSchemeParams({});
      updateFormData('path', '');
    } else if (value === '') {
      setIsCustomPath(false);
      setSelectedScheme('');
      setSchemeParams({});
      updateFormData('path', '');
    } else {
      setIsCustomPath(false);
      setSelectedScheme(value);
      const placeholders = extractPlaceholders(value);
      const newParams: Record<string, string> = {};
      placeholders.forEach(p => newParams[p] = '');
      setSchemeParams(newParams);

      // 플레이스홀더가 없으면 바로 경로 설정
      if (placeholders.length === 0) {
        updateFormData('path', value);
      } else {
        updateFormData('path', '');
      }
    }
  };

  // 파라미터 입력 핸들러
  const handleParamChange = (param: string, value: string) => {
    const newParams = {...schemeParams, [param]: value};
    setSchemeParams(newParams);

    // 모든 파라미터가 입력되었는지 확인
    const allFilled = Object.values(newParams).every(v => v.trim() !== '');
    if (allFilled) {
      // 플레이스홀더를 실제 값으로 치환
      let finalPath = selectedScheme;
      Object.entries(newParams).forEach(([key, val]) => {
        finalPath = finalPath.replace(`{{${key}}}`, val);
      });
      updateFormData('path', finalPath);
    } else {
      updateFormData('path', '');
    }
  };

  const handleUserToggle = (userId: string, nickname: string) => {
    if (isUserSelected(userId)) {
      handleRemoveUser(userId);
    } else {
      handleAddUser(userId, nickname);
    }
  };

  return (
    <>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-tag me-2"></i>푸시 타입
        </Form.Label>
        <Form.Select
          value={formData.pushType}
          onChange={(e) => updateFormData("pushType", e.target.value)}
          className="border-2"
        >
          <option value="">푸시 타입을 선택하세요</option>
          <option value="SIMPLE">📢 정보성 푸시</option>
          <option value="SIMPLE_MARKETING">🎯 광고성 푸시</option>
        </Form.Select>
        <Form.Text className="text-muted small d-block">
          {!formData.pushType && "푸시 알림의 유형을 선택하세요"}
          {formData.pushType === "SIMPLE" && "활동 알림이 활성화되어 있는 디바이스로만 푸시가 발송됩니다"}
          {formData.pushType === "SIMPLE_MARKETING" && (
            <>
              활동 알림 + 마케팅 수신 동의가 활성화된 디바이스로만 푸시가 발송됩니다
              <br/>
              <span className="text-warning">※ 21:00 ~ 08:00인 경우 야간 광고성 푸시 수신 동의한 디바이스로만 발송</span>
            </>
          )}
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-people me-2"></i>발송 대상
        </Form.Label>
        <Tab.Container activeKey={formData.targetType} onSelect={(key) => updateFormData("targetType", key)}>
          <Nav variant="pills" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="USER" className="px-4">
                <i className="bi bi-person me-2"></i>유저
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="BOSS" className="px-4" disabled>
                <i className="bi bi-briefcase me-2"></i>사장님 (준비중)
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="USER">
              <Form.Text className="text-muted small d-block mb-3">
                일반 사용자에게 푸시를 발송합니다
              </Form.Text>
            </Tab.Pane>
            <Tab.Pane eventKey="BOSS">
              <Form.Text className="text-muted small d-block mb-3">
                사장님 계정에게 푸시를 발송합니다 (준비중)
              </Form.Text>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Form.Group>

      {formData.targetType === "USER" && (
        <UserSearch
          nicknameSearch={searchState.nicknameSearch}
          onNicknameChange={updateNicknameSearch}
          onSearch={searchUserByNickname}
          searchLoading={searchState.searchLoading}
          searchResults={searchState.searchResults}
          isUserSelected={isUserSelected}
          onUserToggle={handleUserToggle}
          selectedUsers={selectedUsers}
          onUserRemove={handleRemoveUser}
        />
      )}

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-people me-2"></i>대상 {formData.targetType === "USER" ? "사용자" : "사장님"} ID
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder={formData.targetType === "USER"
            ? "사용자 ID를 쉼표로 구분하여 입력하거나, 위에서 검색하여 추가하세요"
            : "사장님 ID를 쉼표로 구분하여 입력하세요"
          }
          value={formData.accountIdsInput}
          onChange={(e) => updateFormData("accountIdsInput", e.target.value)}
          className="border-2"
        />
        <Form.Text className="text-muted small">
          여러 {formData.targetType === "USER" ? "사용자" : "사장님"}에게 발송하려면 쉼표로 구분해주세요
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-type me-2"></i>제목 (선택)
        </Form.Label>
        <Form.Control
          type="text"
          placeholder="푸시 제목을 입력하세요"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
          className="border-2"
          maxLength={50}
        />
        <Form.Text className="text-muted small">
          {formData.title.length}/50자 (제목과 내용 중 하나는 필수입니다)
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-chat-text me-2"></i>내용 (선택)
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="푸시 메시지 내용을 입력하세요"
          value={formData.body}
          onChange={(e) => updateFormData("body", e.target.value)}
          className="border-2"
          maxLength={200}
        />
        <Form.Text className="text-muted small">
          {formData.body.length}/200자 (제목과 내용 중 하나는 필수입니다)
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-image me-2"></i>푸시 이미지 (선택)
        </Form.Label>
        {formData.imageUrl ? (
          <div className="border rounded p-3 bg-light">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <small className="text-success fw-medium">
                <i className="bi bi-check-circle-fill me-1"></i>
                이미지가 업로드되었습니다
              </small>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={removeImage}
              >
                <i className="bi bi-trash me-1"></i>제거
              </Button>
            </div>
            <div className="text-center">
              <img
                src={formData.imageUrl}
                alt="푸시 이미지 미리보기"
                className="img-fluid rounded"
                style={{maxHeight: '200px', maxWidth: '100%'}}
              />
            </div>
          </div>
        ) : (
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: any) => {
              const file = e.target.files[0];
              if (file) uploadImage(file);
            }}
            className="border-2"
            disabled={uiState.uploading}
          />
        )}
        <Form.Text className="text-muted small">
          {uiState.uploading
            ? "이미지 업로드 중..."
            : "JPG, PNG 형식의 이미지를 업로드할 수 있습니다"
          }
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-link-45deg me-2"></i>이동 경로 <span className="text-danger">*</span>
        </Form.Label>

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
            placeholder="/home, /event 등"
            value={formData.path}
            onChange={(e) => updateFormData("path", e.target.value)}
            className="border-2 mb-2"
          />
        )}

        {/* 최종 경로 미리보기 */}
        {formData.path && (
          <div className="bg-success-subtle border border-success rounded p-2 mb-2">
            <small className="text-success fw-medium">
              <i className="bi bi-check-circle-fill me-1"></i>
              최종 경로:
            </small>
            <code className="ms-2 text-success">{formData.path}</code>
          </div>
        )}

        <Form.Text className="text-muted small">
          {!formData.path && <span className="text-danger">* 필수 항목: </span>}
          푸시 터치 시 이동할 앱 화면 경로를 선택하거나 직접 입력하세요
        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">
          <i className="bi bi-phone me-2"></i>대상 OS
        </Form.Label>
        <div className="d-flex gap-3">
          {Object.values(PUSH_OS_PLATFORM).map((platform) => (
            <Form.Check
              key={platform}
              type="checkbox"
              id={`os-${platform}`}
              label={
                <span className="d-flex align-items-center gap-2">
                  <i className={`bi ${platform === 'AOS' ? 'bi-android2' : 'bi-apple'}`}></i>
                  {getOsPlatformDisplayName(platform)}
                </span>
              }
              checked={targetOsPlatforms.has(platform)}
              onChange={() => toggleOsPlatform(platform)}
              className="user-select-none"
            />
          ))}
        </div>
        <Form.Text className="text-muted small">
          {targetOsPlatforms.size === 0
            ? "최소 하나의 OS를 선택해야 합니다"
            : `${Array.from(targetOsPlatforms).map(p => getOsPlatformDisplayName(p)).join(', ')} 기기들에 발송됩니다`
          }
        </Form.Text>
      </Form.Group>
    </>
  );
};

export default PushFormFields;
