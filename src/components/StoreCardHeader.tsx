import {ReactNode} from 'react';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {SimpleStore} from '@/types/store';

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 2;

interface Props {
  store?: SimpleStore | null;
  /** 가게명 클릭 콜백 (가게 상세 모달 열기) */
  onStoreClick?: (store: SimpleStore) => void;
  /** 가게명 우측 영역 (예: 평점, 작성 시각) */
  aside?: ReactNode;
  /** 가게 타입·카테고리 앞에 붙는 배지 (예: 상태) */
  badges?: ReactNode;
}

/** 전체 가게 목록 카드의 가게 정보 헤더 (가게명·주소·타입·카테고리) */
const StoreCardHeader = ({store, onStoreClick, aside, badges}: Props) => {
  const categories = store?.categories || [];
  return (
    <>
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div className="min-w-0">
          {store ? (
            <button
              type="button"
              className="btn btn-link p-0 text-start item-card__name text-decoration-none"
              disabled={!onStoreClick}
              onClick={(e) => {
                e.stopPropagation();
                onStoreClick?.(store);
              }}
            >
              <i className="bi bi-shop me-1"/>
              {store.name || '가게 이름 없음'}
              {onStoreClick && <i className="bi bi-box-arrow-up-right ms-1 small"/>}
            </button>
          ) : (
            <h3 className="item-card__name mb-0">가게 정보 없음</h3>
          )}
          {store?.address?.fullAddress && (
            <p className="item-card__desc mb-0">
              <i className="bi bi-geo-alt me-1"/>
              {store.address.fullAddress}
            </p>
          )}
        </div>
        {aside}
      </div>

      <div className="form-chips">
        {badges}
        {store?.storeType && <StoreTypeBadge storeType={store.storeType} size="sm"/>}
        {categories.slice(0, VISIBLE_CATEGORIES).map((category, idx) => (
          <span key={idx} className="form-chip">{category.name}</span>
        ))}
        {categories.length > VISIBLE_CATEGORIES && (
          <span className="form-chip">+{categories.length - VISIBLE_CATEGORIES}</span>
        )}
      </div>
    </>
  );
};

export default StoreCardHeader;
