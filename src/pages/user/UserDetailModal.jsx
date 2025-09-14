import React, { useState, useEffect } from 'react';
import { Modal, Tab, Tabs } from 'react-bootstrap';
import Loading from '../../components/common/Loading';
import {
  createUserDetailInfo,
  createUserDeviceInfo,
  getSocialTypeDisplayName,
  getSocialTypeBadgeClass,
  getOsBadgeClass,
  getMarketingConsentDisplayName,
  getMarketingConsentBadgeClass,
  DEVICE_OS
} from '../../types/user';
import userApi from '../../api/userApi';

const UserDetailModal = ({ show, onHide, user }) => {
  const [userDetail, setUserDetail] = useState(null);
  const [devices, setDevices] = useState([]);
  const [settings, setSettings] = useState(null);
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
      // API 호출
      const response = await userApi.getUserDetail(user.userId);
      const { user: userDetail, devices, settings } = response.data;

      setUserDetail(userDetail);
      setDevices(devices);
      setSettings(settings);
    } catch (error) {
      console.error('사용자 상세 정보 조회 실패:', error);
      setError('사용자 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserDetail(null);
    setDevices([]);
    setSettings(null);
    setActiveTab('basic');
    setError(null);
    onHide();
  };

  const getSocialTypeBadge = (socialType) => {
    return (
      <span className={`badge rounded-pill px-3 py-2 ${getSocialTypeBadgeClass(socialType)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-shield-check me-1"></i>
        {getSocialTypeDisplayName(socialType)}
      </span>
    );
  };

  const getOsBadge = (os) => {
    const iconClass = os === DEVICE_OS.IOS ? 'bi-apple' :
                     os === DEVICE_OS.ANDROID ? 'bi-google-play' :
                     'bi-question-circle';

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

  if (!show || !user) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      className="user-detail-modal"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <div className="w-100">
          <div className="d-flex align-items-center gap-3 text-white">
            <div className="bg-white bg-opacity-20 rounded-circle p-3">
              <i className="bi bi-person-circle fs-2"></i>
            </div>
            <div>
              <Modal.Title className="mb-0 fs-3 fw-bold">
                사용자 상세 정보
              </Modal.Title>
              <p className="mb-0 opacity-90">
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
              <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-person-vcard"></i>
                  기본 정보
                </span>
              }
            >
              <div className="p-4">
                <div className="row justify-content-center">
                  <div className="col-md-10">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="text-center mb-4">
                          <h4 className="fw-bold text-dark mb-1">{userDetail?.nickname}</h4>
                          <p className="text-muted mb-3">사용자 기본 정보</p>
                        </div>

                        <div className="row g-4">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-hash text-primary"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">유저 ID</label>
                                <p className="mb-0 fw-bold text-dark">{userDetail?.userId}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-person-badge text-success"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">닉네임</label>
                                <p className="mb-0 fw-bold text-dark">{userDetail?.nickname}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-shield-lock text-warning"></i>
                              </div>
                              <div className="flex-grow-1">
                                <label className="form-label fw-semibold text-muted mb-2">소셜 가입 방식</label>
                                <div>
                                  {getSocialTypeBadge(userDetail?.socialType)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-phone"></i>
                  디바이스 정보
                  {devices.length > 0 && (
                    <span className="badge bg-info rounded-pill ms-1">{devices.length}</span>
                  )}
                </span>
              }
            >
              <div className="p-4">
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
                        <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="bi bi-phone fs-1 text-secondary"></i>
                        </div>
                        <h5 className="text-dark mb-2">등록된 디바이스가 없습니다</h5>
                        <p className="text-muted">아직 등록된 디바이스 정보가 없습니다.</p>
                      </div>
                    ) : (
                      <div className="row g-0">
                        {devices.map((device, index) => (
                          <div key={device.deviceId || index} className="col-12">
                            <div className="device-item p-4 border-bottom">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="bg-light rounded-circle p-3">
                                    <i className={`bi ${device.os === DEVICE_OS.IOS ? 'bi-apple' : device.os === DEVICE_OS.ANDROID ? 'bi-android2' : 'bi-question-circle'} fs-4 text-primary`}></i>
                                  </div>
                                  <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <h6 className="mb-0 fw-bold text-dark">{device.deviceId}</h6>
                                      {getOsBadge(device.os)}
                                    </div>
                                    <div className="text-muted small">
                                      <i className="bi bi-app me-1"></i>
                                      버전:
                                      <span className="badge bg-info ms-1">{device.appVersion}</span>
                                    </div>
                                  </div>
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

            {/* 설정 정보 탭 */}
            <Tab
              eventKey="settings"
              title={
                <span className="d-flex align-items-center gap-2">
                  <i className="bi bi-gear"></i>
                  설정 정보
                </span>
              }
            >
              <div className="p-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-light border-0 p-4">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-gear text-warning"></i>
                      </div>
                      <h5 className="mb-0 fw-bold text-dark">사용자 설정</h5>
                    </div>
                  </div>
                  <div className="card-body p-4">
                    {!settings ? (
                      <div className="text-center py-4">
                        <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <i className="bi bi-gear fs-3 text-secondary"></i>
                        </div>
                        <h6 className="text-dark mb-1">설정 정보가 없습니다</h6>
                        <p className="text-muted small">사용자 설정 정보를 불러올 수 없습니다.</p>
                      </div>
                    ) : (
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                              <i className="bi bi-bell text-primary"></i>
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-label fw-semibold text-muted mb-1">활동 알림</label>
                              <div>
                                <span className={`badge rounded-pill px-3 py-2 ${settings.enableActivitiesPush ? 'bg-success bg-opacity-10 text-success border border-success' : 'bg-secondary bg-opacity-10 text-secondary border border-secondary'}`}>
                                  <i className={`bi ${settings.enableActivitiesPush ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                  {settings.enableActivitiesPush ? 'ON' : 'OFF'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                            <div className="bg-info bg-opacity-10 rounded-circle p-2">
                              <i className="bi bi-envelope text-info"></i>
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-label fw-semibold text-muted mb-1">마케팅 수신 동의</label>
                              <div>
                                <span className={`badge rounded-pill px-3 py-2 ${getMarketingConsentBadgeClass(settings.marketingConsent)} bg-opacity-10 text-dark border`}>
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