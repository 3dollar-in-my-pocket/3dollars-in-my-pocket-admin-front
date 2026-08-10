import DetailField from '@/components/common/DetailField';
import {SocialType, User, UserRole, UserRoleOption, UserSettings} from '@/types/user';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {
  getMarketingConsentBadgeClass,
  getMarketingConsentDisplayName,
  getSocialTypeBadgeClass,
  getSocialTypeDisplayName,
  getUserRoleBadgeClass,
  getUserRoleLabel,
  getUserRoleValue
} from '@/utils/display/userDisplay';

interface UserBasicInfoTabProps {
  /** 상세 조회 결과 */
  userDetail: User | null;
  /** 유저 설정 정보 */
  settings: UserSettings | null;
  /** 선택 가능한 유저 권한 목록 */
  userRoleOptions: UserRoleOption[];
  /** 현재 선택된 권한 값 */
  selectedRole: string;
  /** 권한 변경 진행 중 여부 */
  isUpdatingRole: boolean;
  /** 권한 선택 변경 콜백 */
  onSelectedRoleChange: (role: string) => void;
  /** 권한 변경 실행 콜백 */
  onUpdateRole: () => void;
}

/**
 * 유저 상세 모달의 기본 정보 탭
 */
const UserBasicInfoTab = ({
                            userDetail,
                            settings,
                            userRoleOptions,
                            selectedRole,
                            isUpdatingRole,
                            onSelectedRoleChange,
                            onUpdateRole
                          }: UserBasicInfoTabProps) => {
  const getSocialTypeBadge = (socialType?: SocialType) => (
    <span className={`badge ${getSocialTypeBadgeClass(socialType)} bg-opacity-10 text-dark border`}>
      <i className="bi bi-shield-check me-1"/>
      {getSocialTypeDisplayName(socialType)}
    </span>
  );

  const getUserRoleBadge = (role?: UserRole) => (
    <span className={`badge ${getUserRoleBadgeClass(role)} bg-opacity-10 border`}>
      <i className="bi bi-person-gear me-1"/>
      {getUserRoleLabel(role, userRoleOptions)}
    </span>
  );

  /** 설정 ON/OFF 배지 */
  const getToggleBadge = (enabled?: boolean) => (
    <span className={`badge ${enabled ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}>
      <i className={`bi ${enabled ? 'bi-check-circle' : 'bi-x-circle'} me-1`}/>
      {enabled ? 'ON' : 'OFF'}
    </span>
  );

  const isRoleUnchanged = !selectedRole || selectedRole === userDetail?.role;

  return (
    <div className="history-panel">
      {/* 일반 정보 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-person-vcard"/>
          일반 정보
        </h3>
        <div className="row g-3">
          <DetailField label="이름" className="col-12 col-md-6">
            {userDetail?.name}
          </DetailField>
          <DetailField label="닉네임" className="col-12 col-md-6">
            {userDetail?.nickname}
          </DetailField>
          <DetailField label="유저 ID" className="col-6 col-md-4" monospace>
            {userDetail?.userId}
          </DetailField>
          <DetailField label="소셜 가입 방식" className="col-6 col-md-4">
            {getSocialTypeBadge(userDetail?.socialType)}
          </DetailField>
          <DetailField label="가입일" className="col-12 col-md-4">
            {formatDateTime(userDetail?.createdAt)}
          </DetailField>
        </div>
      </div>

      {/* 권한 관리 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-person-gear"/>
          권한 관리
        </h3>
        <div className="row g-3 align-items-end">
          <DetailField label="현재 권한" className="col-12 col-md-4">
            {getUserRoleBadge(userDetail?.role)}
          </DetailField>
          <div className="col-12 col-md-5">
            <label className="form-label" htmlFor="user-role-select">권한 변경</label>
            <select
              id="user-role-select"
              className="form-select form-select-sm"
              value={selectedRole}
              onChange={(event) => onSelectedRoleChange(event.target.value)}
              disabled={isUpdatingRole || !userDetail?.userId || userRoleOptions.length === 0}
            >
              <option value="">권한 선택</option>
              {userRoleOptions.map((roleOption) => {
                const roleValue = getUserRoleValue(roleOption);
                return (
                  <option key={roleValue} value={roleValue}>
                    {getUserRoleLabel(roleValue, userRoleOptions)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <button
              type="button"
              className="btn btn-sm btn-outline-primary w-100"
              onClick={onUpdateRole}
              disabled={isUpdatingRole || isRoleUnchanged}
            >
              {isUpdatingRole ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                  변경 중
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1"/>
                  권한 변경
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 설정 정보 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-gear"/>
          설정 정보
        </h3>
        {!settings ? (
          <p className="text-body-tertiary small mb-0">사용자 설정 정보를 불러올 수 없습니다.</p>
        ) : (
          <div className="row g-3">
            <DetailField label="활동 알림" className="col-12 col-md-6">
              {getToggleBadge(settings.enableActivitiesPush)}
            </DetailField>
            <DetailField label="마케팅 수신 동의" className="col-12 col-md-6">
              <span
                className={`badge ${getMarketingConsentBadgeClass(settings.marketingConsent)} bg-opacity-10 text-dark border`}>
                <i className="bi bi-shield-check me-1"/>
                {getMarketingConsentDisplayName(settings.marketingConsent)}
              </span>
            </DetailField>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBasicInfoTab;
