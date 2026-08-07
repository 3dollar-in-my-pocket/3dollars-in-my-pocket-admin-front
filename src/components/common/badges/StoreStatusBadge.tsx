import {
  getStoreStatusBadgeClass,
  getStoreStatusDisplayName
} from '@/utils/display/storeDisplay';
import { StoreStatus } from '@/types/store';
import { BadgeSize } from './StoreTypeBadge';

interface StoreStatusBadgeProps {
  status?: StoreStatus | string | null;
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

/**
 * 가게 상태(활성/삭제) 배지
 */
const StoreStatusBadge = ({
  status,
  size = 'sm',
  withIcon = false,
  className = ''
}: StoreStatusBadgeProps) => {
  if (!status) return null;

  const value = status as StoreStatus;

  return (
    <span
      className={`badge ${getStoreStatusBadgeClass(value)} bg-opacity-10 text-dark border rounded-pill ${SIZE_CLASS[size]}${className ? ' ' + className : ''}`}
    >
      {withIcon && <i className="bi bi-shop me-1"></i>}
      {getStoreStatusDisplayName(value)}
    </span>
  );
};

export default StoreStatusBadge;
