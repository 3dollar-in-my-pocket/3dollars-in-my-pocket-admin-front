import {formatRating} from '@/utils/formatUtils';
import {
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon,
  getLabelBadgeClass,
  getLabelDisplayName,
  getLabelIcon,
  getStoreStatusBadgeClass,
  getStoreStatusDisplayName,
  getStoreTypeBadgeClass,
  getStoreTypeDisplayName,
  getStoreTypeIcon
} from '@/utils/display/storeDisplay';
import ItemCard from '@/components/common/ItemCard';
import {SimpleStore} from '@/types/store';
import {BulkSelectHandler} from '@/types/common';

interface StoreCardProps {
  store: SimpleStore;
  onClick: (store: SimpleStore) => void;
  /** 목록에서 삭제 처리된 가게를 비활성 상태로 표시할 때 사용 */
  isDeleted?: boolean;
  selected?: boolean;
  onSelect?: BulkSelectHandler<number>;
  /** 목록 내 순서 (Shift + 클릭 범위 선택에 사용) */
  index?: number;
}

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 2;

const StoreCard = ({store, onClick, isDeleted = false, selected = false, onSelect, index}: StoreCardProps) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <ItemCard
        item={store}
        onClick={isDeleted ? undefined : onClick}
        muted={isDeleted}
        className={`h-100 ${selected ? 'border border-primary border-2' : ''}`}
      >
        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-start justify-content-between gap-2">
          <div className="min-w-0">
            <h3 className="item-card__name text-truncate" title={store.name}>
              <i className="bi bi-shop me-1 text-body-tertiary"/>
              {store.name}
            </h3>
            <p className="item-card__desc mb-0 text-truncate" title={store.address?.fullAddress}>
              <i className="bi bi-geo-alt me-1"/>
              {store.address?.fullAddress || '주소 정보 없음'}
            </p>
          </div>
          <div className="d-flex align-items-center justify-content-between justify-content-sm-end gap-2 flex-shrink-0">
          {onSelect && !isDeleted && <button type="button"
            className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-outline-secondary'}`}
            aria-pressed={selected} aria-label={`가게 ${store.storeId} ${selected ? '선택 해제' : '선택'}`}
            onClick={event => { event.stopPropagation(); onSelect(store.storeId, index, event); }}>
            <i className={`bi ${selected ? 'bi-check-square-fill' : 'bi-square'} me-1`}/>
            {selected ? '선택됨' : '선택'}
          </button>}<span className="rating-badge flex-shrink-0">
            <i className="bi bi-star-fill"/>
            {formatRating(store.rating)}
          </span>
          </div>
        </div>

        <div className="form-chips">
          {isDeleted ? (
            <span className="badge bg-danger-subtle text-danger-emphasis">
              <i className="bi bi-trash me-1"/>
              삭제된 가게
            </span>
          ) : (
            <span className={`badge ${getStoreStatusBadgeClass(store.status)}`}>
              {getStoreStatusDisplayName(store.status)}
            </span>
          )}
          {store.storeType && (
            <span className={`badge ${getStoreTypeBadgeClass(store.storeType)} text-white`}>
              <i className={`bi ${getStoreTypeIcon(store.storeType)} me-1`}/>
              {getStoreTypeDisplayName(store.storeType)}
            </span>
          )}
          <span className={`badge ${getActivitiesStatusBadgeClass(store.activitiesStatus)}`}>
            <i className="bi bi-activity me-1"/>
            {getActivitiesStatusDisplayName(store.activitiesStatus)}
          </span>
          {store.labels?.map((label, idx) => (
            <span key={idx} className={`badge ${getLabelBadgeClass(label)}`}>
              <i className={`bi ${getLabelIcon(label)} me-1`}/>
              {getLabelDisplayName(label)}
            </span>
          ))}
          {store.categories?.slice(0, VISIBLE_CATEGORIES).map((category, idx) => (
            <span key={idx} className="form-chip">
              <i className={`bi ${getCategoryIcon(category.categoryId)}`}/>
              {category?.name}
            </span>
          ))}
          {store.categories && store.categories.length > VISIBLE_CATEGORIES && (
            <span className="form-chip">+{store.categories.length - VISIBLE_CATEGORIES}</span>
          )}
        </div>

        <p className="item-card__desc mt-auto pt-3 mb-0">
          <i className="bi bi-calendar3 me-1"/>
          {formatDateTime(store.createdAt)} 등록
        </p>
      </ItemCard>
    </div>
  );
};

export default StoreCard;
