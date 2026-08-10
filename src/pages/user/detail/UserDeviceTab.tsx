import {toast} from 'react-toastify';
import DetailField from '@/components/common/DetailField';
import EmptyState from '@/components/common/EmptyState';
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

const getOsBadge = (os: OsPlatform) => (
  <span className={`badge ${getOsPlatformBadgeClass(os)} bg-opacity-10 text-dark border`}>
    <i className={`bi ${getOsPlatformIcon(os)} me-1`}/>
    {os}
  </span>
);

/** OS별 대표 아이콘 */
const getOsIcon = (os: OsPlatform): string => {
  if (os === OS_PLATFORM.IOS) return 'bi-apple';
  if (os === OS_PLATFORM.AOS) return 'bi-android2';
  return 'bi-question-circle';
};

/**
 * 유저 상세 모달의 디바이스 정보 탭
 */
const UserDeviceTab = ({devices, isLoading, onDeleteDevice}: UserDeviceTabProps) => {
  const handleCopyToken = (pushToken: string) => {
    navigator.clipboard.writeText(pushToken);
    toast.success('푸시 토큰이 복사되었습니다');
  };

  return (
    <div className="history-panel">
      <div className="history-panel__head">
        <h3 className="history-panel__title">
          <i className="bi bi-phone"/>
          등록된 디바이스
          {devices.length > 0 && (
            <span className="history-panel__count">{devices.length}</span>
          )}
        </h3>
      </div>

      {devices.length === 0 ? (
        <EmptyState
          icon="bi-phone"
          title="등록된 디바이스가 없습니다"
          description="아직 등록된 디바이스 정보가 없습니다."
        />
      ) : (
        <div className="row g-3">
          {devices.map((device, index) => (
            <div key={device.deviceId || index} className="col-12 col-xl-6">
              <div className="item-card h-100">
                <div className="item-card__body">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
                    <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                      <h4 className="item-card__name">
                        <i className={`bi ${getOsIcon(device.osPlatform)} me-1`}/>
                        디바이스 {index + 1}
                      </h4>
                      {getOsBadge(device.osPlatform)}
                      <span className="form-chip font-monospace">v{device.appVersion}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger flex-shrink-0"
                      onClick={() => onDeleteDevice(device.deviceId)}
                      disabled={isLoading}
                    >
                      <i className="bi bi-trash me-1"/>
                      삭제
                    </button>
                  </div>

                  <div className="row g-3">
                    <DetailField label="최초 등록일자" className="col-12 col-sm-6">
                      {formatDateTime(device.createdAt)}
                    </DetailField>
                    <DetailField label="마지막 접근 일자" className="col-12 col-sm-6">
                      {formatDateTime(device.updatedAt)}
                    </DetailField>
                    <DetailField label="푸시 토큰" className="col-12" placeholder="토큰 없음">
                      {device.pushToken ? (
                        <span className="d-flex align-items-center gap-2">
                          <span className="font-monospace small text-truncate" title={device.pushToken}>
                            {device.pushToken}
                          </span>
                          <button
                            className="btn btn-sm btn-outline-secondary flex-shrink-0"
                            onClick={() => handleCopyToken(device.pushToken)}
                            title="토큰 복사"
                            aria-label="푸시 토큰 복사"
                          >
                            <i className="bi bi-clipboard"/>
                          </button>
                        </span>
                      ) : null}
                    </DetailField>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDeviceTab;
