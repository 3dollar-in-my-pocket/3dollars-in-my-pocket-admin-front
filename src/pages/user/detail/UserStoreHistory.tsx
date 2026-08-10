import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback} from 'react';
import storeApi from '@/api/storeApi';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {ActivitiesStatus, SimpleStore} from '@/types/store';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {getActivitiesStatusBadgeClass, getActivitiesStatusDisplayName} from '@/utils/display/storeDisplay';

interface UserStoreHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserStoreHistory = ({userId, isActive, onStoreClick}: UserStoreHistoryProps) => {
  const fetchUserStores = useCallback(
    (cursor: string | null) => storeApi.getUserStores(userId, cursor, 20),
    [userId]
  );

  const {
    items: stores,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore
  } = useCursorPagination<SimpleStore>({
    fetcher: fetchUserStores,
    enabled: Boolean(userId && isActive),
    deps: [userId]
  });

  const handleStoreClick = (store: SimpleStore) => {
    if (onStoreClick) {
      onStoreClick(store);
    }
  };

  const getActivitiesStatusBadge = (activitiesStatus?: ActivitiesStatus) => {
    if (!activitiesStatus) return null;
    // getActivitiesStatusBadgeClass는 'bg-primary' 형태를 반환하므로 subtle 배지 클래스로 변환한다
    const color = getActivitiesStatusBadgeClass(activitiesStatus).replace('bg-', '');
    const statusText = getActivitiesStatusDisplayName(activitiesStatus);
    return (
      <span className={`badge bg-${color}-subtle text-${color}-emphasis`}>
        {statusText}
      </span>
    );
  };

  return (
    <HistoryPanel
      title="제보한 가게 목록"
      icon="bi-shop"
      count={stores.length}
      totalCount={totalCount}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={loadMore}
      emptyTitle="제보한 가게가 없습니다"
      emptyDescription="아직 제보한 가게가 없습니다."
    >
      {stores.map((store) => (
        <div
          key={store.storeId}
          className="item-card item-card--clickable mb-3"
          role="button"
          tabIndex={0}
          onClick={() => handleStoreClick(store)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleStoreClick(store);
            }
          }}
        >
          <div className="item-card__body">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div className="min-w-0">
                <h3 className="item-card__name">{store.name || '이름 없음'}</h3>
                <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                  <StoreStatusBadge status={store.status} size="md"/>
                  {getActivitiesStatusBadge(store.activitiesStatus)}
                  <StoreTypeBadge storeType={store.storeType}/>
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-success flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStoreClick(store);
                }}
              >
                <i className="bi bi-arrow-right"/>
              </button>
            </div>

            <p className="item-card__desc">
              <i className="bi bi-geo-alt me-1"/>
              {store.address?.fullAddress || '주소 정보 없음'}
            </p>

            <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
              <span className="rating-badge">
                <i className="bi bi-star-fill"/>
                {store.rating ? store.rating.toFixed(1) : '0.0'}점
              </span>
              {store.categories?.slice(0, 3).map((category, idx) => (
                <span key={idx} className="badge bg-primary-subtle text-primary-emphasis">
                  {category?.name || '카테고리'}
                </span>
              ))}
              {store.categories && store.categories.length > 3 && (
                <span className="badge bg-secondary-subtle text-secondary-emphasis">
                  +{store.categories.length - 3}개 더
                </span>
              )}
            </div>

            {store.createdAt && (
              <p className="item-card__desc">
                <i className="bi bi-clock me-1"/>
                제보일: {formatDateTime(store.createdAt)}
              </p>
            )}
          </div>
        </div>
      ))}
    </HistoryPanel>
  );
};

export default UserStoreHistory;
