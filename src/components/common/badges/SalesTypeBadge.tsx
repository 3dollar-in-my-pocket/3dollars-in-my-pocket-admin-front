import {BadgeSize} from './StoreTypeBadge';

/** 응답이 { type, description } 객체로 내려옵니다. */
export interface SalesTypeValue {
  type?: string;
  description?: string;
}

interface SalesTypeBadgeProps {
  salesType?: SalesTypeValue | null;
  size?: BadgeSize;
  /** 아이콘 표시 (상세 화면용) */
  withIcon?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 small',
  md: 'px-2 py-1',
  lg: 'px-3 py-2'
};

const BADGE_CLASS: Record<string, string> = {
  ROAD: 'bg-success',
  STORE: 'bg-primary'
};

/**
 * 판매 형태(길거리/매장) 배지
 *
 * 서버가 내려주는 description을 우선 표시합니다.
 */
const SalesTypeBadge = ({
                          salesType,
                          size = 'sm',
                          withIcon = false,
                          className = ''
                        }: SalesTypeBadgeProps) => {
  if (!salesType) return null;

  const badgeClass = BADGE_CLASS[salesType.type || ''] || 'bg-secondary';

  return (
    <span
      className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill ${SIZE_CLASS[size]}${className ? ' ' + className : ''}`}
    >
      {withIcon && <i className="bi bi-shop me-1"></i>}
      {salesType.description || salesType.type}
    </span>
  );
};

export default SalesTypeBadge;
