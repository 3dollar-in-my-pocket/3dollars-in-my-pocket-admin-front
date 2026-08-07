import StoreStatusBadge from './common/badges/StoreStatusBadge';
import StoreTypeBadge from './common/badges/StoreTypeBadge';
import {useCallback, useRef} from 'react';
import storeApi from '../api/storeApi';
import useCursorPagination from '../hooks/useCursorPagination';
import {ActivitiesStatus, SimpleStore} from '../types/store';
import {formatDateTimeKo as formatDateTime} from '../utils/dateUtils';
import {getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName, getStoreStatusBadgeClass, getStoreStatusDisplayName, getStoreTypeBadgeClass, getStoreTypeDisplayName, getStoreTypeIcon} from '../utils/display/storeDisplay';

interface UserStoreHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserStoreHistory = ({userId, isActive, onStoreClick}: UserStoreHistoryProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchUserStores = useCallback(
    (cursor: string | null) => storeApi.getUserStores(userId, cursor, 20),
    [userId]
  );

  const {
    items: stores,
    isLoading,
    hasMore,
    totalCount,
    loadMore
  } = useCursorPagination<SimpleStore>({
    fetcher: fetchUserStores,
    enabled: Boolean(userId && isActive),
    deps: [userId]
  });

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const {scrollTop, scrollHeight, clientHeight} = e.currentTarget;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  const handleStoreClick = (store: SimpleStore) => {
    if (onStoreClick) {
      onStoreClick(store);
    }
  };



  const getActivitiesStatusBadge = (activitiesStatus?: ActivitiesStatus) => {
    if (!activitiesStatus) return null;
    const badgeClass = getActivitiesStatusBadgeClass(activitiesStatus);
    const statusText = getActivitiesStatusDisplayName(activitiesStatus);
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };


  const getDayOfWeekInKorean = (dayOfWeek: string): string => {
    const dayMap: Record<string, string> = {
      'MONDAY': '월요일',
      'TUESDAY': '화요일',
      'WEDNESDAY': '수요일',
      'THURSDAY': '목요일',
      'FRIDAY': '금요일',
      'SATURDAY': '토요일',
      'SUNDAY': '일요일'
    };
    return dayMap[dayOfWeek] || dayOfWeek;
  };

  const sortDaysByWeekOrder = (days: string[]): string[] => {
    if (!days || !Array.isArray(days)) return [];
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  };

  const getPaymentMethodInKorean = (method: string): string => {
    const methodMap: Record<string, string> = {
      'CASH': '현금',
      'ACCOUNT_TRANSFER': '계좌이체',
      'CARD': '카드'
    };
    return methodMap[method] || method;
  };

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-4 p-4 rounded-4 shadow-sm"
             style={{
               background: 'linear-gradient(135deg, #e8f5e8 0%, #f8fffe 100%)',
               border: '1px solid rgba(40, 167, 69, 0.1)'
             }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success rounded-circle p-3 shadow-sm"
                 style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'}}>
              <i className="bi bi-shop text-white fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">제보한 가게 목록</h6>
              <small className="text-muted">사용자가 등록한 가게 정보를 확인하세요</small>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success px-3 py-2 rounded-pill shadow-sm" style={{fontSize: '0.9rem'}}>
                <i className="bi bi-collection me-1"></i>
                총 {totalCount}개
              </span>
            </div>
          )}
        </div>
      </div>
      <div
        className="px-4"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{maxHeight: '500px', overflowY: 'auto'}}
      >
        {stores.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-shop fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">제보한 가게가 없습니다</h5>
            <p className="text-muted">아직 제보한 가게가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {stores.map((store, index) => (
              <div key={store.storeId} className="col-12">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onClick={() => handleStoreClick(store)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = '#28a745';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2 shadow-sm">
                            <i className="bi bi-shop text-success"></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold text-dark">{store.name || '이름 없음'}</h6>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                              {<StoreStatusBadge status={store.status} size="md"/>}
                              {getActivitiesStatusBadge(store.activitiesStatus)}
                              {<StoreTypeBadge storeType={store.storeType}/>}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="d-flex align-items-start gap-2 mb-2">
                            <i className="bi bi-geo-alt text-muted mt-1"></i>
                            <span className="text-muted small">{store.address?.fullAddress || '주소 정보 없음'}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-star-fill text-warning"></i>
                            <span className="text-dark fw-medium small">
                                {store.rating ? store.rating.toFixed(1) : '0.0'}점
                              </span>
                          </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {store.categories?.slice(0, 3).map((category, idx) => (
                            <span key={idx} className="badge rounded-pill px-3 py-1 small"
                                  style={{
                                    background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                                    color: 'white',
                                    border: 'none'
                                  }}>
                                {category?.name || '카테고리'}
                              </span>
                          ))}
                          {store.categories && store.categories.length > 3 && (
                            <span className="badge bg-light text-dark border rounded-pill px-3 py-1 small">
                                +{store.categories.length - 3}개 더
                              </span>
                          )}
                        </div>

                        {store.createdAt && (
                          <div className="d-flex align-items-center gap-2 text-muted small">
                            <i className="bi bi-clock me-1"></i>
                            제보일: {formatDateTime(store.createdAt)}
                          </div>
                        )}
                      </div>

                      <div className="ms-3">
                        <button
                          className="btn btn-sm rounded-pill px-3 py-2 shadow-sm"
                          style={{
                            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                            color: 'white',
                            border: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoreClick(store);
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && stores.length > 0 && (
          <div className="text-center p-3 bg-light">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">추가 데이터 로딩 중...</p>
          </div>
        )}

        {isLoading && stores.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">가게 정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요...</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default UserStoreHistory;

