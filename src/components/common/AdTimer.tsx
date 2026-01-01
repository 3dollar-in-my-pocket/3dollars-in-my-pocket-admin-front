import {useState, useEffect} from 'react';
import {getAdStatus} from '../../utils/timeUtils';

/**
 * 광고 상태와 타이머를 표시하는 컴포넌트
 */
const AdTimer = ({startDateTime, endDateTime, className = ""}) => {
  const [status, setStatus] = useState(null);

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
      {status.status !== 'active' && (
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
