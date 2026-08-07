import {toast} from 'react-toastify';
import {Device, OS_PLATFORM, OsPlatform} from '@/types/device';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {getOsPlatformBadgeClass, getOsPlatformIcon} from '@/utils/display/deviceDisplay';

interface UserDeviceTabProps {
  /** 유저에 등록된 디바이스 목록 */
  devices: Device[];
  /** 로딩 중 여부 (삭제 버튼 비활성화에 사용) */
  isLoading: boolean;
  /** 디바이스 삭제 콜백 */
  onDeleteDevice: (deviceId: string) => void;
}

const getOsBadge = (os: OsPlatform) => {
  const iconClass = getOsPlatformIcon(os);

  return (
    <span className={`badge rounded-pill px-3 py-2 ${getOsPlatformBadgeClass(os)} bg-opacity-10 text-dark border`}>
      <i className={`bi ${iconClass} me-1`}></i>
      {os}
    </span>
  );
};

/**
 * 유저 상세 모달의 디바이스 정보 탭
 */
const UserDeviceTab = ({devices, isLoading, onDeleteDevice}: UserDeviceTabProps) => {
  return (
    <div className="p-1 p-sm-2 p-md-4">
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
                    <div className="card-body p-2 p-sm-3 p-md-4">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="position-relative">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-3" style={{
                            border: '2px solid',
                            borderColor: device.osPlatform === OS_PLATFORM.IOS ? '#007aff' : '#34c759'
                          }}>
                            <i
                              className={`bi ${device.osPlatform === OS_PLATFORM.IOS ? 'bi-apple' : device.osPlatform === OS_PLATFORM.AOS ? 'bi-android2' : 'bi-question-circle'} fs-3`}
                              style={{color: device.osPlatform === OS_PLATFORM.IOS ? '#007aff' : '#34c759'}}></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h6 className="mb-0 fw-bold text-dark">디바이스 {index + 1}</h6>
                            {getOsBadge(device.osPlatform)}
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
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <span className="text-muted small">
                                <i className="bi bi-clock-history me-1"></i>
                                마지막 접근 일자
                              </span>
                              <span className="text-dark small fw-medium">
                                {formatDateTime(device.updatedAt)}
                              </span>
                            </div>
                          )}

                          {device.pushToken && (
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted small">
                                <i className="bi bi-bell me-1"></i>
                                푸시 토큰
                              </span>
                              <div className="d-flex align-items-center gap-2 flex-grow-1">
                                <span
                                  className="text-dark small fw-medium text-truncate flex-grow-1"
                                  style={{
                                    maxWidth: '200px',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace'
                                  }}
                                  title={device.pushToken}
                                >
                                  {device.pushToken}
                                </span>
                                <button
                                  className="btn btn-outline-secondary btn-sm p-1"
                                  style={{fontSize: '0.7rem', lineHeight: '1'}}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(device.pushToken || '');
                                    toast.success('푸시 토큰이 복사되었습니다');
                                  }}
                                  title="토큰 복사"
                                >
                                  <i className="bi bi-clipboard"></i>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          className="btn btn-outline-danger btn-sm rounded-pill px-3"
                          onClick={() => onDeleteDevice(device.deviceId)}
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
  );
};

export default UserDeviceTab;
