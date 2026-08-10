import {useEffect, useState} from 'react';
import {getAdStatus} from '@/utils/timeUtils';

/** getAdStatus의 반환 값 (timeUtils가 JS 스타일이라 status는 string으로 내려옵니다) */
interface AdStatus {
  status: string;
  label: string;
  timeText: string;
  badgeClass: string;
}

interface AdTimerProps {
  startDateTime: string;
  endDateTime: string;
  className?: string;
  /** 상태 배지 표시 여부. 목록처럼 이미 상태를 노출하는 곳에서는 false로 끈다. */
  showStatusBadge?: boolean;
}

/**
 * 광고 상태와 타이머를 표시하는 컴포넌트
 */
const AdTimer = ({startDateTime, endDateTime, className = "", showStatusBadge = true}: AdTimerProps) => {
  const [status, setStatus] = useState<AdStatus | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const currentStatus = getAdStatus(startDateTime, endDateTime);
      setStatus(currentStatus);
    };

    // 초기 상태 설정
    updateStatus();

    // 1초마다 업데이트
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [startDateTime, endDateTime]);

  if (!status) {
    return null;
  }

  const getTimerIcon = () => {
    switch (status.status) {
      case 'scheduled':
        return '⏰';
      case 'active':
        return '🔴';
      case 'ended':
        return '✅';
      default:
        return '⏰';
    }
  };

  return (
    <div className={`d-flex flex-column ${className}`}>
      {showStatusBadge && status.status !== 'active' && (
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <span className={`badge ${status.badgeClass} d-flex align-items-center gap-1`} style={{fontSize: '0.75rem'}}>
            <span>{getTimerIcon()}</span>
            {status.label}
          </span>
        </div>
      )}
      <div className="text-center">
        <div
          className="fw-bold px-3 py-2 rounded"
          style={{
            fontSize: '0.85rem',
            color: status.status === 'ended' ? '#6c757d' : '#0d6efd',
            backgroundColor: status.status === 'ended' ? '#f8f9fa' : '#e7f3ff',
            border: `1px solid ${status.status === 'ended' ? '#dee2e6' : '#b6d7ff'}`
          }}
        >
          {status.timeText}
        </div>
      </div>
    </div>
  );
};

export default AdTimer;
