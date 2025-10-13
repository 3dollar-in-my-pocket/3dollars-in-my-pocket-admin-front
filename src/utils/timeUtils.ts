/**
 * 두 날짜 사이의 차이를 계산하여 사용자 친화적인 형태로 반환합니다.
 *
 * @param {string} targetDate - 목표 날짜 (ISO 문자열)
 * @param {Date} currentDate - 현재 날짜 (기본값: 현재 시간)
 * @param {string} eventType - 이벤트 타입 ('start' 또는 'end')
 * @returns {string} 포맷된 시간 차이 문자열
 */
export const getTimeUntil = (targetDate, currentDate = new Date(), eventType = 'start') => {
  const target = new Date(targetDate);
  const current = currentDate;
  const diffMs = target.getTime() - current.getTime();

  // 이미 지난 시간인 경우
  if (diffMs <= 0) {
    return "종료됨";
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  const suffix = eventType === 'start' ? '시작' : '종료';

  // 30초 미만
  if (diffSeconds < 30) {
    return `곧 ${suffix}`;
  }

  // 1분 미만
  if (diffMinutes < 1) {
    return `${diffSeconds}초 후 ${suffix}`;
  }

  // 1시간 미만
  if (diffHours < 1) {
    const remainingSeconds = diffSeconds % 60;
    if (diffMinutes < 10 && remainingSeconds > 0) {
      return `${diffMinutes}분 ${remainingSeconds}초 후 ${suffix}`;
    }
    return `${diffMinutes}분 후 ${suffix}`;
  }

  // 1일 미만
  if (diffDays < 1) {
    const remainingMinutes = diffMinutes % 60;
    if (diffHours <= 5 && remainingMinutes > 0) {
      return `${diffHours}시간 ${remainingMinutes}분 후 ${suffix}`;
    }
    return `${diffHours}시간 후 ${suffix}`;
  }

  // 100일 이상
  if (diffDays >= 100) {
    return `100+일 후 ${suffix}`;
  }

  // 1일 이상
  const remainingHours = diffHours % 24;
  if (remainingHours === 0) {
    return `${diffDays}일 후 ${suffix}`;
  }
  return `${diffDays}일 ${remainingHours}시간 후 ${suffix}`;
};

/**
 * 광고 상태를 반환합니다.
 *
 * @param {string} startDateTime - 광고 시작 시간
 * @param {string} endDateTime - 광고 종료 시간
 * @param {Date} currentDate - 현재 날짜 (기본값: 현재 시간)
 * @returns {object} 광고 상태 정보
 */
export const getAdStatus = (startDateTime, endDateTime, currentDate = new Date()) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);
  const current = currentDate;

  if (current < start) {
    return {
      status: 'scheduled',
      label: '예정',
      timeText: getTimeUntil(startDateTime, current, 'start'),
      badgeClass: 'bg-warning text-dark'
    };
  } else if (current >= start && current <= end) {
    return {
      status: 'active',
      label: '진행중',
      timeText: getTimeUntil(endDateTime, current, 'end'),
      badgeClass: 'bg-success'
    };
  } else {
    return {
      status: 'ended',
      label: '종료',
      timeText: '종료됨',
      badgeClass: 'bg-secondary'
    };
  }
};