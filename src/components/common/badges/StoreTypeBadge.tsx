import React from 'react';
import {
  getStoreTypeBadgeClass,
  getStoreTypeDisplayName,
  getStoreTypeIcon
} from '@/utils/display/storeDisplay';
import { StoreType } from '@/types/store';

export type BadgeSize = 'sm' | 'md' | 'lg';

interface StoreTypeBadgeProps {
  storeType?: StoreType | string | null;
  /** sm: 목록/카드, md: 기본, lg: 상세 화면 */
  size?: BadgeSize;
  /** 테두리 표시 (상세 화면용) */
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 small',
  md: 'px-3 py-1',
  lg: 'px-3 py-2'
};

/**
 * 가게 유형(유저 제보 / 사장님) 배지
 */
const StoreTypeBadge = ({
  storeType,
  size = 'sm',
  bordered = false,
  className = '',
  style
}: StoreTypeBadgeProps) => {
  if (!storeType) return null;

  const type = storeType as StoreType;

  return (
    <span
      className={`badge ${getStoreTypeBadgeClass(type)} text-white rounded-pill ${SIZE_CLASS[size]}${bordered ? ' border' : ''}${className ? ' ' + className : ''}`}
      style={style}
    >
      <i className={`bi ${getStoreTypeIcon(type)} me-1`}></i>
      {getStoreTypeDisplayName(type)}
    </span>
  );
};

export default StoreTypeBadge;
