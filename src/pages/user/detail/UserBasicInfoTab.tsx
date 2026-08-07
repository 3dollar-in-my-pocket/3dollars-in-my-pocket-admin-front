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
  const getSocialTypeBadge = (socialType?: SocialType) => {
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getSocialTypeBadgeClass(socialType)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-shield-check me-1"></i>
        {getSocialTypeDisplayName(socialType)}
      </span>
    );
  };

  const getUserRoleBadge = (role?: UserRole) => {
    return (
      <span className={`badge rounded-pill px-3 py-2 ${getUserRoleBadgeClass(role)} bg-opacity-10 border`}>
        <i className="bi bi-person-gear me-1"></i>
        {getUserRoleLabel(role, userRoleOptions)}
      </span>
    );
  };

  return (
    <div className="p-1 p-sm-2 p-md-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10">
          {/* 일반 정보 섹션 */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-light border-0 p-2 p-sm-3 p-md-4">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                  <i className="bi bi-person-vcard text-primary"></i>
                </div>
                <h5 className="mb-0 fw-bold text-dark">일반 정보</h5>
              </div>
            </div>
            <div className="card-body p-2 p-sm-3 p-md-4">
              <div className="text-center mb-4">
                <h4 className="fw-bold text-dark mb-1">{userDetail?.name}</h4>
              </div>

              <div className="row g-3 g-md-4">
                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-hash text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label fw-semibold text-muted mb-1 small">유저 ID</label>
                      <p className="mb-0 fw-bold text-dark" style={{
                        fontSize: '0.9rem',
                        wordBreak: 'break-all'
                      }}>{userDetail?.userId}</p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-person-badge text-success"></i>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label fw-semibold text-muted mb-1 small">닉네임</label>
                      <p className="mb-0 fw-bold text-dark" style={{
                        fontSize: '0.9rem',
                        wordBreak: 'break-all'
                      }}>{userDetail?.nickname}</p>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-shield-lock text-warning"></i>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label fw-semibold text-muted mb-2 small">소셜 가입 방식</label>
                      <div>
                        {getSocialTypeBadge(userDetail?.socialType)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column flex-sm-row align-items-start gap-2 gap-sm-3 p-3 bg-light rounded-3">
                    <div className="bg-danger bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-person-gear text-danger"></i>
                    </div>
                    <div className="flex-grow-1 w-100">
                      <label className="form-label fw-semibold text-muted mb-2 small">유저 권한</label>
                      <div className="mb-2">
                        {getUserRoleBadge(userDetail?.role)}
                      </div>
                      <div className="d-flex flex-column flex-sm-row gap-2">
                        <select
                          className="form-select form-select-sm flex-grow-1"
                          value={selectedRole}
                          onChange={(e) => onSelectedRoleChange(e.target.value)}
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
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm d-inline-flex align-items-center justify-content-center gap-1 px-3"
                          onClick={onUpdateRole}
                          disabled={isUpdatingRole || !selectedRole || selectedRole === userDetail?.role}
                          style={{whiteSpace: 'nowrap'}}
                        >
                          {isUpdatingRole ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              변경 중
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check2-circle"></i>
                              변경
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div
                    className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                    <div className="bg-info bg-opacity-10 rounded-circle p-2">
                      <i className="bi bi-calendar3 text-info"></i>
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label fw-semibold text-muted mb-1 small">가입일</label>
                      <p className="mb-0 fw-bold text-dark" style={{
                        fontSize: '0.85rem',
                        wordBreak: 'break-all'
                      }}>{formatDateTime(userDetail?.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 설정 정보 섹션 */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light border-0 p-2 p-sm-3 p-md-4">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                  <i className="bi bi-gear text-warning"></i>
                </div>
                <h5 className="mb-0 fw-bold text-dark">설정 정보</h5>
              </div>
            </div>
            <div className="card-body p-2 p-sm-3 p-md-4">
              {!settings ? (
                <div className="text-center py-4">
                  <div className="bg-light rounded-circle mx-auto mb-3" style={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="bi bi-gear fs-3 text-secondary"></i>
                  </div>
                  <h6 className="text-dark mb-1">설정 정보가 없습니다</h6>
                  <p className="text-muted small">사용자 설정 정보를 불러올 수 없습니다.</p>
                </div>
              ) : (
                <div className="row g-3 g-md-4">
                  <div className="col-12 col-md-6">
                    <div
                      className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-bell text-primary"></i>
                      </div>
                      <div className="flex-grow-1">
                        <label className="form-label fw-semibold text-muted mb-1 small">활동 알림</label>
                        <div>
                          <span
                            className={`badge rounded-pill px-2 px-md-3 py-1 py-md-2 ${settings.enableActivitiesPush ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary'}`}
                            style={{fontSize: '0.75rem'}}>
                            <i
                              className={`bi ${settings.enableActivitiesPush ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                            {settings.enableActivitiesPush ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <div
                      className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-envelope text-info"></i>
                      </div>
                      <div className="flex-grow-1">
                        <label className="form-label fw-semibold text-muted mb-1 small">마케팅 수신 동의</label>
                        <div>
                          <span
                            className={`badge rounded-pill px-2 px-md-3 py-1 py-md-2 ${getMarketingConsentBadgeClass(settings.marketingConsent)} bg-opacity-10 text-dark border`}
                            style={{fontSize: '0.75rem'}}>
                            <i className="bi bi-shield-check me-1"></i>
                            {getMarketingConsentDisplayName(settings.marketingConsent)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBasicInfoTab;
