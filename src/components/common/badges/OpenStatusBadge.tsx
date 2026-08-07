import {
  getOpenStatusBadgeClass,
  getOpenStatusDisplayName
} from '@/utils/display/storeDisplay';

/** 응답이 { status, isOpening } 형태로 내려옵니다. */
export interface OpenStatusValue {
  status?: string;
  isOpening?: boolean;
}

interface OpenStatusBadgeProps {
  openStatus?: OpenStatusValue | null;
  className?: string;
}

/**
 * 영업 상태(영업중/영업종료) 배지
 */
const OpenStatusBadge = ({openStatus, className = ''}: OpenStatusBadgeProps) => {
  if (!openStatus) return null;

  return (
    <span
      className={`badge rounded-pill px-3 py-2 ${getOpenStatusBadgeClass(openStatus.status as any)} bg-opacity-10 text-dark border${className ? ' ' + className : ''}`}
    >
      <i className={`bi ${openStatus.isOpening ? 'bi-unlock' : 'bi-lock'} me-1`}></i>
      {getOpenStatusDisplayName(openStatus.status as any)}
    </span>
  );
};

export default OpenStatusBadge;
