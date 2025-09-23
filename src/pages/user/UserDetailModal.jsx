import {useEffect, useState} from 'react';
import {Modal, Tab, Tabs} from 'react-bootstrap';
import {
  getMarketingConsentBadgeClass,
  getMarketingConsentDisplayName,
  getSocialTypeBadgeClass,
  getSocialTypeDisplayName
} from '../../types/user';
import {DEVICE_OS, getOsBadgeClass,} from '../../types/device';
import userApi from '../../api/userApi';
import {toast} from 'react-toastify';
import ActivityHistory from '../../components/ActivityHistory';
import UserStoreHistory from '../../components/UserStoreHistory';
import UserReviewHistory from '../../components/UserReviewHistory';
import UserVisitHistory from '../../components/UserVisitHistory';
import UserStoreImageHistory from '../../components/UserStoreImageHistory';
import UserStoreReportHistory from '../../components/UserStoreReportHistory';
import deviceApi from "../../api/deviceApi";

const UserDetailModal = ({show, onHide, user, onStoreClick}) => {
  const [userDetail, setUserDetail] = useState(null);
  const [devices, setDevices] = useState([]);
  const [settings, setSettings] = useState(null);
  const [representativeMedal, setRepresentativeMedal] = useState(null);
  const [medals, setMedals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (show && user) {
      fetchUserDetail();
    }
  }, [show, user]);

  const fetchUserDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [userResponse, devicesResponse] = await Promise.all([
        userApi.getUserDetail(user.userId),
        deviceApi.getUserDevices(user.userId)
      ]);

      if (!userResponse.ok) {
        return
      }

      const userData = userResponse.data;

      setUserDetail(userData.user);
      setSettings(userData.setting);
      setRepresentativeMedal(userData.representativeMedal);
      setMedals(userData.medals || []);

      if (devicesResponse.ok) {
        setDevices(devicesResponse.data || []);
      } else {
        setDevices([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserDetail(null);
    setDevices([]);
    setSettings(null);
    setRepresentativeMedal(null);
    setMedals([]);
    setActiveTab('basic');
    setError(null);
    onHide();
  };

  const getSocialTypeBadge = (socialType) => {
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getSocialTypeBadgeClass(socialType)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-shield-check me-1"></i>
        {getSocialTypeDisplayName(socialType)}
      </span>
    );
  };

  const getOsBadge = (os) => {
    const iconClass = os === DEVICE_OS.IOS ? 'bi-apple' : os === DEVICE_OS.AOS ? 'bi-google-play' : 'bi-question-circle';

    return (
      <span className={`badge rounded-pill px-3 py-2 ${getOsBadgeClass(os)} bg-opacity-10 text-dark border`}>
        <i className={`bi ${iconClass} me-1`}></i>
        {os}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 디바이스 삭제 핸들러
  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm('정말로 이 디바이스를 삭제하시겠습니까?')) return;
    setIsLoading(true);
    try {
      const response = await deviceApi.deleteDevice(deviceId);
      if (response.status >= 400) {
        toast.error('디바이스 삭제에 실패했습니다.');
        return;
      }
      // 삭제 성공 시 상태에서 제거
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
      toast.success('디바이스가 성공적으로 삭제되었습니다.');
    } catch (error) {
      toast.error('디바이스 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show || !user) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      className="user-detail-modal"
      fullscreen="md-down"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}
      >
        <div className="w-100">
          <div className="d-flex align-items-center gap-3 text-white">
            <div>
              <Modal.Title className="mb-0 fs-4 fs-md-3 fw-bold">
                사용자 상세 정보
              </Modal.Title>
              <p className="mb-0 opacity-90 small">
                {user.nickname}님의 정보를 확인하세요
              </p>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요.</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <div className="mb-4">
              <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
              </div>
            </div>
            <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
            <p className="text-muted mb-3">{error}</p>
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => fetchUserDetail()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              다시 시도
            </button>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="nav-fill border-0"
            style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
            }}
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2">
                  <i className="bi bi-person-vcard"></i>
                  <span className="d-none d-sm-inline">기본 정보</span>
                  <span className="d-sm-none">기본</span>
                </span>
              }
            >
              <div className="p-2 p-md-4">
                <div className="row justify-content-center">
                  <div className="col-12 col-md-10">
                    {/* 일반 정보 섹션 */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-light border-0 p-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-person-vcard text-primary"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-dark">일반 정보</h5>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="text-center mb-4">
                          <h4 className="fw-bold text-dark mb-1">{userDetail?.name}</h4>
                        </div>

                        <div className="row g-3 g-md-4">
                          <div className="col-12 col-md-6">
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
                      <div className="card-header bg-light border-0 p-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-gear text-warning"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-dark">설정 정보</h5>
                        </div>
                      </div>
                      <div className="card-body p-4">
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
                              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
                              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3 p-3 bg-light rounded-3">
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
            </Tab>

            {/* 디바이스 정보 탭 */}
            <Tab
              eventKey="devices"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2">
                  <i className="bi bi-phone"></i>
                  <span className="d-none d-sm-inline">디바이스 정보</span>
                  <span className="d-sm-none">기기</span>
                  {devices.length > 0 && (
                    <span className="badge bg-info rounded-pill ms-1">{devices.length}</span>
                  )}
                </span>
              }
            >
              <div className="p-2 p-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-0 p-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-phone text-info"></i>
                      </div>
                      <h5 className="mb-0 fw-bold text-dark">등록된 디바이스 목록</h5>
                      {devices.length > 0 && (
                        <span className="badge bg-info ms-auto px-3 py-2 rounded-pill">
                          총 {devices.length}개
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body p-0">
                    {devices.length === 0 ? (
                      <div className="text-center py-5">
                        <div className="bg-light rounded-circle mx-auto mb-4" style={{
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="bi bi-phone fs-1 text-secondary"></i>
                        </div>
                        <h5 className="text-dark mb-2">등록된 디바이스가 없습니다</h5>
                        <p className="text-muted">아직 등록된 디바이스 정보가 없습니다.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {devices.map((device, index) => (
                          <div key={device.deviceId || index} className="col-12 col-md-6">
                            <div className="card border-0 shadow-sm h-100" style={{
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                              border: '1px solid #e9ecef',
                              borderRadius: '16px'
                            }}>
                              <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                  <div className="position-relative">
                                    <div className="bg-primary bg-opacity-10 rounded-circle p-3" style={{
                                      border: '2px solid',
                                      borderColor: device.os === DEVICE_OS.IOS ? '#007aff' : '#34c759'
                                    }}>
                                      <i
                                        className={`bi ${device.os === DEVICE_OS.IOS ? 'bi-apple' : device.os === DEVICE_OS.AOS ? 'bi-android2' : 'bi-question-circle'} fs-3`}
                                        style={{color: device.os === DEVICE_OS.IOS ? '#007aff' : '#34c759'}}></i>
                                    </div>
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <h6 className="mb-0 fw-bold text-dark">디바이스 {index + 1}</h6>
                                      {getOsBadge(device.os)}
                                    </div>
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                      <span className="text-muted small">
                                        앱 버전
                                      </span>
                                      <span
                                        className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1 small">
                                        v{device.appVersion}
                                      </span>
                                    </div>

                                    {device.createdAt && (
                                      <div className="d-flex align-items-center gap-2 mb-1">
                                        <span className="text-muted small">
                                          <i className="bi bi-calendar-plus me-1"></i>
                                          최초 등록일자
                                        </span>
                                        <span className="text-dark small fw-medium">
                                          {formatDateTime(device.createdAt)}
                                        </span>
                                      </div>
                                    )}

                                    {device.updatedAt && (
                                      <div className="d-flex align-items-center gap-2">
                                        <span className="text-muted small">
                                          <i className="bi bi-clock-history me-1"></i>
                                          마지막 접근 일자
                                        </span>
                                        <span className="text-dark small fw-medium">
                                          {formatDateTime(device.updatedAt)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="d-flex justify-content-end">
                                  <button
                                    className="btn btn-outline-danger btn-sm rounded-pill px-3"
                                    onClick={() => handleDeleteDevice(device.deviceId)}
                                    disabled={isLoading}
                                  >
                                    <i className="bi bi-trash me-1"></i> 삭제
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tab>

            {/* 메달 정보 탭 */}
            <Tab
              eventKey="medals"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2">
                  <i className="bi bi-award"></i>
                  <span className="d-none d-sm-inline">메달 정보</span>
                  <span className="d-sm-none">메달</span>
                  {medals.length > 0 && (
                    <span className="badge bg-warning rounded-pill ms-1">{medals.length}</span>
                  )}
                </span>
              }
            >
              <div className="p-2 p-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-0 p-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-award text-warning"></i>
                      </div>
                      <h5 className="mb-0 fw-bold text-dark">보유 메달</h5>
                      {medals.length > 0 && (
                        <span className="badge bg-warning ms-auto px-3 py-2 rounded-pill">
                          총 {medals.length}개
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="card-body p-4">
                    {/* 대표 메달 섹션 */}
                    {representativeMedal && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                          <i className="bi bi-star-fill text-warning"></i>
                          대표 메달
                        </h6>
                        <div className="card border-warning border-2" style={{
                          background: 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)',
                          borderRadius: '16px'
                        }}>
                          <div className="card-body p-4">
                            <div className="d-flex align-items-center gap-3">
                              <div className="position-relative">
                                <img
                                  src={representativeMedal.iconUrl}
                                  alt={representativeMedal.name}
                                  className="rounded-circle"
                                  style={{width: '60px', height: '60px', objectFit: 'cover'}}
                                  onError={(e) => {
                                    e.target.src = representativeMedal.disableIconUrl || '/default-medal.png';
                                  }}
                                />
                                <div className="position-absolute top-0 start-100 translate-middle">
                                  <i className="bi bi-star-fill text-warning fs-5"></i>
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="fw-bold text-dark mb-1">{representativeMedal.name}</h6>
                                <p className="text-muted mb-2 small">{representativeMedal.introduction}</p>
                                {representativeMedal.acquisition?.description && (
                                  <div className="d-flex align-items-center gap-2">
                                    <span
                                      className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                                      style={{fontSize: '0.7rem'}}>
                                      <i className="bi bi-info-circle me-1"></i>
                                      {representativeMedal.acquisition.description}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 전체 메달 목록 */}
                    <div>
                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                        <i className="bi bi-collection text-primary"></i>
                        전체 보유 메달
                      </h6>
                      {medals.length === 0 ? (
                        <div className="text-center py-5">
                          <div className="bg-light rounded-circle mx-auto mb-4" style={{
                            width: '80px',
                            height: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-award fs-1 text-secondary"></i>
                          </div>
                          <h5 className="text-dark mb-2">보유한 메달이 없습니다</h5>
                          <p className="text-muted">아직 획득한 메달이 없습니다.</p>
                        </div>
                      ) : (
                        <div className="row g-3">
                          {medals.map((medal, index) => {
                            const isRepresentative = representativeMedal?.medalId === medal.medalId;
                            return (
                              <div key={medal.medalId || index} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div
                                  className={`card border-0 shadow-sm h-100 ${isRepresentative ? 'border-warning border-2' : ''}`}
                                  style={{
                                    background: isRepresentative
                                      ? 'linear-gradient(135deg, #fff3cd 0%, #ffffff 100%)'
                                      : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                    borderRadius: '16px'
                                  }}>
                                  <div className="card-body p-3">
                                    <div className="d-flex flex-column align-items-center text-center">
                                      <div className="position-relative mb-3">
                                        <img
                                          src={medal.iconUrl}
                                          alt={medal.name}
                                          className="rounded-circle"
                                          style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                          onError={(e) => {
                                            e.target.src = medal.disableIconUrl || '/default-medal.png';
                                          }}
                                        />
                                        {isRepresentative && (
                                          <div className="position-absolute top-0 start-100 translate-middle">
                                            <i className="bi bi-star-fill text-warning"></i>
                                          </div>
                                        )}
                                      </div>
                                      <h6 className="fw-bold text-dark mb-1 small">{medal.name}</h6>
                                      <p className="text-muted mb-2 small"
                                         style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                                        {medal.introduction}
                                      </p>
                                      {medal.acquisition?.description && (
                                        <span
                                          className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                                          style={{fontSize: '0.7rem'}}>
                                          <i className="bi bi-info-circle me-1"></i>
                                          {medal.acquisition.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Tab>


            {/* 활동 이력 탭 */}
            <Tab
              eventKey="activity"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2">
                  <i className="bi bi-activity"></i>
                  <span className="d-none d-sm-inline">활동 이력</span>
                  <span className="d-sm-none">활동</span>
                </span>
              }
            >
              <ActivityHistory
                type="user"
                entityId={user?.userId}
                onStoreClick={onStoreClick}
                tabs={[
                  {
                    key: 'stores',
                    title: '제보한 가게 목록',
                    icon: 'bi-shop',
                    component: UserStoreHistory,
                    spinnerColor: 'text-success',
                    loadingText: '데이터를 불러오는 중...'
                  },
                  {
                    key: 'reviews',
                    title: '리뷰 이력',
                    icon: 'bi-chat-square-text',
                    component: UserReviewHistory,
                    spinnerColor: 'text-primary',
                    loadingText: '리뷰 데이터를 불러오는 중...'
                  },
                  {
                    key: 'visits',
                    title: '방문 이력',
                    icon: 'bi-geo-alt',
                    component: UserVisitHistory,
                    spinnerColor: 'text-warning',
                    loadingText: '방문 이력을 불러오는 중...'
                  },
                  {
                    key: 'images',
                    title: '이미지 등록 이력',
                    icon: 'bi-image',
                    component: UserStoreImageHistory,
                    spinnerColor: 'text-info',
                    loadingText: '이미지 등록 이력을 불러오는 중...'
                  },
                  {
                    key: 'reports',
                    title: '가게 신고 이력',
                    icon: 'bi-shield-exclamation',
                    component: UserStoreReportHistory,
                    spinnerColor: 'text-danger',
                    loadingText: '신고 이력을 불러오는 중...'
                  }
                ]}
              />
            </Tab>
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <button
          className="btn btn-secondary rounded-pill px-4"
          onClick={handleClose}
        >
          <i className="bi bi-x-lg me-2"></i>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetailModal;

