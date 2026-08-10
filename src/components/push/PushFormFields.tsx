import {getOsPlatformDisplayName} from '@/utils/display/deviceDisplay';
import React, {useEffect, useState} from 'react';
import {PUSH_OS_PLATFORM, PushOsPlatform} from '@/types/device';
import UserSearch, {PushSearchUser, PushSelectedUser} from './UserSearch';
import applicationApi, {AppScheme} from '@/api/applicationApi';
import SectionCard from '@/components/common/SectionCard';
import {AD_BODY_SUFFIX, AD_TITLE_PREFIX, AdNoticeStatus, isMarketingPush} from '@/utils/pushUtils';

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
  /** 광고성 푸시 법정 표기 누락 여부 */
  adNotice: AdNoticeStatus;
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

const TITLE_MAX = 50;
const BODY_MAX = 200;

/** 발송 대상 유형 선택지 */
const TARGET_TYPES = [
  {
    value: 'USER',
    icon: 'bi-person-fill',
    name: '유저',
    desc: '일반 사용자에게 발송합니다',
    disabled: false
  },
  {
    value: 'BOSS',
    icon: 'bi-briefcase-fill',
    name: '사장님',
    desc: '준비 중인 기능입니다',
    disabled: true
  }
];

/** 푸시 타입 선택지 */
const PUSH_TYPES = [
  {
    value: 'SIMPLE',
    icon: 'bi-info-circle-fill',
    name: '정보성 푸시',
    desc: '활동 알림이 켜진 기기에만 발송'
  },
  {
    value: 'SIMPLE_MARKETING',
    icon: 'bi-megaphone-fill',
    name: '광고성 푸시',
    desc: '활동 알림 + 마케팅 수신 동의 기기에만 발송'
  }
];

const PushFormFields = ({
                          formData,
                          searchState,
                          selectedUsers,
                          uiState,
                          targetOsPlatforms,
                          adNotice,
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

  const targetLabel = formData.targetType === 'USER' ? '사용자' : '사장님';
  const isMarketing = isMarketingPush(formData.pushType);

  return (
    <>
      {/* 1. 발송 대상 */}
      <SectionCard title="발송 대상" icon="bi-people-fill">
        <div className="form-field">
          <span className="form-field__label">
            <i className="bi bi-person-badge"/>
            대상 유형
          </span>
          <div className="form-options">
            {TARGET_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`form-option ${formData.targetType === type.value ? 'form-option--active' : ''}`}
                onClick={() => updateFormData('targetType', type.value)}
                disabled={type.disabled}
                aria-pressed={formData.targetType === type.value}
              >
                <i className={`bi ${type.icon} form-option__icon`}/>
                <span>
                  <span className="form-option__name">{type.name}</span>
                  <span className="form-option__desc">{type.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {formData.targetType === 'USER' && (
          <UserSearch
            nicknameSearch={searchState.nicknameSearch}
            onNicknameChange={updateNicknameSearch}
            onSearch={searchUserByNickname}
            searchLoading={searchState.searchLoading}
            searchResults={searchState.searchResults}
            isUserSelected={isUserSelected}
            onUserToggle={handleAddUser}
            selectedUsers={selectedUsers}
            onUserRemove={handleRemoveUser}
          />
        )}

        <div className="form-field">
          <label className="form-field__label" htmlFor="push-account-ids">
            <i className="bi bi-list-ol"/>
            대상 {targetLabel} ID
            <span className="form-required">*</span>
          </label>
          <textarea
            id="push-account-ids"
            className="form-control"
            rows={3}
            placeholder={formData.targetType === 'USER'
              ? '사용자 ID를 쉼표로 구분하여 입력하거나, 위에서 검색하여 추가하세요'
              : '사장님 ID를 쉼표로 구분하여 입력하세요'}
            value={formData.accountIdsInput}
            onChange={(e) => updateFormData('accountIdsInput', e.target.value)}
          />
          <p className="form-field__hint">
            여러 {targetLabel}에게 발송하려면 쉼표(,)로 구분해주세요.
          </p>
        </div>

        <div className="form-field">
          <span className="form-field__label">
            <i className="bi bi-phone"/>
            대상 OS
            <span className="form-required">*</span>
          </span>
          <div className="form-options">
            {Object.values(PUSH_OS_PLATFORM).map((platform) => (
              <button
                key={platform}
                type="button"
                className={`form-option ${targetOsPlatforms.has(platform) ? 'form-option--active' : ''}`}
                onClick={() => toggleOsPlatform(platform)}
                aria-pressed={targetOsPlatforms.has(platform)}
              >
                <i className={`bi ${platform === 'AOS' ? 'bi-android2' : 'bi-apple'} form-option__icon`}/>
                <span>
                  <span className="form-option__name">{getOsPlatformDisplayName(platform)}</span>
                </span>
                <i
                  className={`bi ms-auto ${targetOsPlatforms.has(platform) ? 'bi-check-circle-fill text-primary' : 'bi-circle text-secondary'}`}
                />
              </button>
            ))}
          </div>
          {targetOsPlatforms.size === 0 && (
            <p className="form-field__hint form-field__hint--danger">
              최소 하나의 OS를 선택해야 합니다.
            </p>
          )}
        </div>
      </SectionCard>

      {/* 2. 푸시 타입 */}
      <SectionCard title="푸시 타입" icon="bi-tag-fill">
        <div className="form-field">
          <div className="form-options">
            {PUSH_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`form-option ${formData.pushType === type.value ? 'form-option--active' : ''}`}
                onClick={() => updateFormData('pushType', type.value)}
                aria-pressed={formData.pushType === type.value}
              >
                <i className={`bi ${type.icon} form-option__icon`}/>
                <span>
                  <span className="form-option__name">{type.name}</span>
                  <span className="form-option__desc">{type.desc}</span>
                </span>
              </button>
            ))}
          </div>
          {!formData.pushType && (
            <p className="form-field__hint form-field__hint--danger">
              푸시 알림의 유형을 선택해야 합니다.
            </p>
          )}
          {isMarketing && (
            <>
              <p className="form-field__hint form-field__hint--warn">
                <i className="bi bi-exclamation-triangle-fill me-1"/>
                21:00 ~ 08:00에는 야간 광고성 푸시 수신에 동의한 기기로만 발송됩니다.
              </p>
              <p className="form-field__hint form-field__hint--warn">
                <i className="bi bi-shield-exclamation me-1"/>
                법정 표기로 제목 앞에 <code>{AD_TITLE_PREFIX}</code>, 본문 끝에 <code>{AD_BODY_SUFFIX}</code>가
                자동으로 입력됩니다. 삭제하지 않는 것을 권장합니다.
              </p>
            </>
          )}
        </div>
      </SectionCard>

      {/* 3. 메시지 내용 */}
      <SectionCard title="메시지" icon="bi-chat-square-text-fill"
                   description="제목과 내용 중 최소 하나는 입력해야 합니다.">
        <div className="form-field">
          <label className="form-field__label" htmlFor="push-title">
            <i className="bi bi-type"/>
            제목
          </label>
          <input
            id="push-title"
            type="text"
            className="form-control"
            placeholder="푸시 제목을 입력하세요"
            value={formData.title}
            onChange={(e) => updateFormData('title', e.target.value)}
            maxLength={TITLE_MAX}
          />
          <div className="form-counter form-field__hint justify-content-end">
            <span className={`form-counter__num ${formData.title.length >= TITLE_MAX ? 'form-counter__num--limit' : ''}`}>
              {formData.title.length}/{TITLE_MAX}
            </span>
          </div>
          {adNotice.missingTitlePrefix && (
            <p className="form-field__hint form-field__hint--danger">
              <i className="bi bi-exclamation-triangle-fill me-1"/>
              광고성 푸시는 제목이 <code>{AD_TITLE_PREFIX}</code>로 시작해야 합니다.
            </p>
          )}
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="push-body">
            <i className="bi bi-chat-text"/>
            내용
          </label>
          <textarea
            id="push-body"
            className="form-control"
            rows={4}
            placeholder="푸시 메시지 내용을 입력하세요"
            value={formData.body}
            onChange={(e) => updateFormData('body', e.target.value)}
            maxLength={BODY_MAX}
          />
          <div className="form-counter form-field__hint justify-content-end">
            <span className={`form-counter__num ${formData.body.length >= BODY_MAX ? 'form-counter__num--limit' : ''}`}>
              {formData.body.length}/{BODY_MAX}
            </span>
          </div>
          {adNotice.missingBodySuffix && (
            <p className="form-field__hint form-field__hint--danger">
              <i className="bi bi-exclamation-triangle-fill me-1"/>
              광고성 푸시는 본문이 <code>{AD_BODY_SUFFIX}</code>로 끝나야 합니다.
            </p>
          )}
        </div>

        <div className="form-field">
          <span className="form-field__label">
            <i className="bi bi-image"/>
            푸시 이미지 (선택)
          </span>
          {formData.imageUrl ? (
            <div className="form-image">
              <img src={formData.imageUrl} alt="푸시 이미지 미리보기" className="form-image__thumb"/>
              <span className="form-image__info">
                <i className="bi bi-check-circle-fill me-1"/>
                이미지가 업로드되었습니다
              </span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={removeImage}>
                <i className="bi bi-trash me-1"/>
                제거
              </button>
            </div>
          ) : (
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
              }}
              disabled={uiState.uploading}
            />
          )}
          <p className="form-field__hint">
            {uiState.uploading ? '이미지 업로드 중...' : 'JPG, PNG 형식의 이미지를 업로드할 수 있습니다.'}
          </p>
        </div>
      </SectionCard>

      {/* 4. 랜딩 링크 */}
      <SectionCard title="랜딩 링크" icon="bi-link-45deg"
                   description="푸시를 눌렀을 때 이동할 앱 화면입니다.">
        <div className="form-field">
          <label className="form-field__label" htmlFor="push-scheme">
            <i className="bi bi-signpost-split"/>
            링크 선택
            <span className="form-required">*</span>
          </label>
          <select
            id="push-scheme"
            className="form-select"
            value={isCustomPath ? 'custom' : selectedScheme}
            onChange={handleSchemeSelect}
          >
            <option value="">링크를 선택하세요</option>
            <option value="custom">직접 입력</option>
            {schemes.map((scheme, index) => (
              <option key={index} value={scheme.path}>
                {scheme.description}
              </option>
            ))}
          </select>

          {/* 플레이스홀더가 있을 때만 원본 스킴을 보여준다. 없으면 최종 경로와 동일해 중복된다. */}
          {selectedScheme && !isCustomPath && Object.keys(schemeParams).length > 0 && (
            <div className="form-code">
              <i className="bi bi-code-square"/>
              {selectedScheme}
            </div>
          )}

          {isCustomPath && (
            <input
              type="text"
              className="form-control mt-2"
              placeholder="/home, /event 등"
              value={formData.path}
              onChange={(e) => updateFormData('path', e.target.value)}
            />
          )}

          {selectedScheme && Object.keys(schemeParams).length > 0 && (
            <div className="form-params">
              <div className="form-params__head">파라미터 입력 (필수)</div>
              {Object.keys(schemeParams).map((param) => (
                <div key={param} className="mb-2">
                  <label className="form-field__label" htmlFor={`push-param-${param}`}>
                    {param}
                    {param === 'storeType' && <span className="text-muted fw-normal">가게 유형</span>}
                  </label>
                  {param === 'storeType' ? (
                    <select
                      id={`push-param-${param}`}
                      className="form-select form-select-sm"
                      value={schemeParams[param]}
                      onChange={(e) => handleParamChange(param, e.target.value)}
                    >
                      <option value="">가게 유형을 선택하세요</option>
                      <option value="USER_STORE">유저 가게</option>
                      <option value="BOSS_STORE">사장님 가게</option>
                    </select>
                  ) : (
                    <input
                      id={`push-param-${param}`}
                      type="text"
                      className="form-control form-control-sm"
                      placeholder={`${param} 값을 입력하세요`}
                      value={schemeParams[param]}
                      onChange={(e) => handleParamChange(param, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {formData.path ? (
            <div className="form-code form-code--done">
              <i className="bi bi-check-circle-fill"/>
              {formData.path}
            </div>
          ) : (
            <p className="form-field__hint form-field__hint--danger">
              랜딩 링크는 필수 항목입니다.
            </p>
          )}
        </div>
      </SectionCard>
    </>
  );
};

export default PushFormFields;
