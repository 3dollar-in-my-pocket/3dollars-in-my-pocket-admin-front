import React from 'react';

interface ItemCardProps<T = any> {
  /** 카드가 표현하는 데이터. onClick 인자로 그대로 전달됩니다. (가게/유저/랭킹 등 도메인이 달라 제네릭) */
  item: T;
  onClick?: (item: T) => void;
  /** 카드 좌측 강조선 색상. 상태를 색으로 구분할 때 사용합니다. */
  accentColor?: string;
  /** 흐리게 처리 (삭제된 항목 등) */
  muted?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 목록 항목 카드 공통 래퍼
 * page.css 의 .item-card 규격을 사용해 목록 화면 간 카드 스타일을 통일한다.
 */
const ItemCard = <T, >({
                         item,
                         onClick,
                         accentColor,
                         muted = false,
                         children,
                         className = '',
                         style = {}
                       }: ItemCardProps<T>) => {
  const isClickable = Boolean(onClick);

  return (
    <div
      className={[
        'item-card',
        isClickable ? 'item-card--clickable' : '',
        muted ? 'item-card--muted' : '',
        className
      ].filter(Boolean).join(' ')}
      style={accentColor ? {borderTopColor: accentColor, borderTopWidth: '3px', ...style} : style}
      onClick={() => onClick?.(item)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.(item);
        }
      }}
    >
      <div className="item-card__body">{children}</div>
    </div>
  );
};

export default ItemCard;
