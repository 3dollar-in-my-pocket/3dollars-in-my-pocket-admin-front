import {Poll, PollOption} from '@/types/poll';

export type PollStatus = 'upcoming' | 'active' | 'ended';

interface PollStatusConfig {
  badgeClass: string;
  icon: string;
  text: string;
}

export const POLL_STATUS_CONFIG: Record<PollStatus, PollStatusConfig> = {
  upcoming: {badgeClass: 'bg-warning-subtle text-warning-emphasis', icon: 'bi-clock', text: '시작 예정'},
  active: {badgeClass: 'bg-success-subtle text-success-emphasis', icon: 'bi-play-circle-fill', text: '진행중'},
  ended: {badgeClass: 'bg-secondary-subtle text-secondary-emphasis', icon: 'bi-stop-circle', text: '종료'}
};

/** 투표 기간을 기준으로 진행 상태를 판단합니다. */
export const getPollStatus = (poll: Poll, now: Date = new Date()): PollStatus => {
  const startDate = new Date(poll.period.startDateTime);
  const endDate = new Date(poll.period.endDateTime);

  if (now < startDate) return 'upcoming';
  if (now < endDate) return 'active';
  return 'ended';
};

/** 전체 옵션의 득표 수 합계 */
export const getTotalVotes = (options: PollOption[] = []): number =>
  options.reduce((total, option) => total + (option.count || 0), 0);

/** 0~1 비율을 퍼센트 정수로 변환 */
export const getPercentage = (ratio?: number): number => Math.round((ratio || 0) * 100);

/**
 * 종료까지 남은 시간 문구
 *
 * 이미 종료된 경우 null을 반환합니다.
 */
export const getTimeRemaining = (endDateTime: string, now: Date = new Date()): string | null => {
  const diff = new Date(endDateTime).getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}일 남음`;
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  return `${minutes}분 남음`;
};

/** 가장 많은 표를 받은 옵션의 optionId. 표가 없으면 null */
export const getWinningOptionId = (options: PollOption[] = []): number | null => {
  if (options.length === 0) return null;

  const top = options.reduce((best, option) =>
    (option.count || 0) > (best.count || 0) ? option : best
  );

  return (top.count || 0) > 0 ? top.optionId : null;
};
