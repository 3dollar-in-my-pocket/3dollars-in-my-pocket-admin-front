import {useEffect, useRef, useState, useCallback} from 'react';
import couponApi from '../../api/couponApi';
import {
  StoreCoupon,
  getCouponStatusDisplayName,
  getCouponStatusBadgeClass,
  formatCouponDate,
  COUPON_STATUS
} from '../../types/coupon';
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from '../../types/store';
import StoreDetailModal from '../store/StoreDetailModal';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../../components/common/EmptyState';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<StoreCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [skeletonCount] = useState(3);
  const isInitialMount = useRef(true);

  // 초기 데이터 로드
  useEffect(() => {
    fetchCoupons(true);
  }, []);

  // 상태 필터 변경 시 재조회
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchCoupons(true);
  }, [selectedStatuses]);

  const fetchCoupons = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const statusesToSend = selectedStatuses.length > 0 ? selectedStatuses : undefined;
      const response = await couponApi.getAllStoreCoupons(reset ? null : cursor, 20, statusesToSend);
      if (!response?.ok) {
        return;
      }

      const {contents = [], cursor: newCursor} = response.data || { contents: [], cursor: { hasMore: false, nextCursor: null } };

      if (reset) {
        setCoupons(contents);
      } else {
        setCoupons(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading, selectedStatuses]);

  // Infinite Scroll 훅 사용
  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchCoupons(false),
    threshold: 0.1
  });

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const calculateProgress = (issued: number, max: number): number => {
    if (max === 0) return 0;
    return Math.round((issued / max) * 100);
  };

  const getStoreTypeBadge = (storeType: string, isMobile = false) => {
    if (!storeType) return null;
    return (
      <span
        className={`badge ${getStoreTypeBadgeClass(storeType as any)} text-white rounded-pill ${isMobile ? 'px-2 py-1' : 'px-3 py-1'}`}
        style={{fontSize: isMobile ? '0.65rem' : '0.75rem', whiteSpace: 'nowrap'}}
      >
        <i className={`bi ${getStoreTypeIcon(storeType as any)} me-1`}></i>
        {getStoreTypeDisplayName(storeType as any)}
      </span>
    );
  };

  const handleStoreClick = (store: any) => {
    setSelectedStore(store);
  };

  // 스켈레톤 로더 컴포넌트
  const SkeletonCard = () => (
    <div className="col-12">
      <div className="card border-0 shadow-sm h-100" style={{background: '#f8f9fa'}}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex gap-2 mb-2">
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{width: '100px', height: '24px'}}></div>
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{width: '80px', height: '24px'}}></div>
          </div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{width: '60%', height: '20px'}}></div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{width: '100%', height: '80px'}}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="mb-4 border-bottom pb-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 className="fw-bold mb-1">
              <i className="bi bi-ticket-perforated text-warning me-2"></i>
              가게 쿠폰 관리
            </h2>
            <p className="text-muted mb-0 small">
              전체 가게에 등록된 쿠폰을 조회하고 관리할 수 있습니다.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
              총 {coupons.length}{hasMore ? '+' : ''}개
            </span>
            <button
              className="btn btn-outline-secondary btn-sm rounded-pill"
              onClick={() => fetchCoupons(true)}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 상태 필터 섹션 */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="text-muted small me-2">
            <i className="bi bi-funnel me-1"></i>
            쿠폰 상태:
          </span>
          <button
            className={`btn btn-sm rounded-pill ${selectedStatuses.length === 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedStatuses([])}
            disabled={isLoading}
          >
            <i className="bi bi-list-ul me-1"></i>
            전체
          </button>
          <button
            className={`btn btn-sm rounded-pill ${selectedStatuses.includes(COUPON_STATUS.ACTIVE) ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => handleStatusToggle(COUPON_STATUS.ACTIVE)}
            disabled={isLoading}
          >
            {selectedStatuses.includes(COUPON_STATUS.ACTIVE) ? (
              <i className="bi bi-check-circle-fill me-1"></i>
            ) : (
              <i className="bi bi-circle me-1"></i>
            )}
            {getCouponStatusDisplayName(COUPON_STATUS.ACTIVE)}
          </button>
          <button
            className={`btn btn-sm rounded-pill ${selectedStatuses.includes(COUPON_STATUS.STOPPED) ? 'btn-warning' : 'btn-outline-warning'}`}
            onClick={() => handleStatusToggle(COUPON_STATUS.STOPPED)}
            disabled={isLoading}
          >
            {selectedStatuses.includes(COUPON_STATUS.STOPPED) ? (
              <i className="bi bi-check-circle-fill me-1"></i>
            ) : (
              <i className="bi bi-circle me-1"></i>
            )}
            {getCouponStatusDisplayName(COUPON_STATUS.STOPPED)}
          </button>
          <button
            className={`btn btn-sm rounded-pill ${selectedStatuses.includes(COUPON_STATUS.ENDED) ? 'btn-secondary' : 'btn-outline-secondary'}`}
            onClick={() => handleStatusToggle(COUPON_STATUS.ENDED)}
            disabled={isLoading}
          >
            {selectedStatuses.includes(COUPON_STATUS.ENDED) ? (
              <i className="bi bi-check-circle-fill me-1"></i>
            ) : (
              <i className="bi bi-circle me-1"></i>
            )}
            {getCouponStatusDisplayName(COUPON_STATUS.ENDED)}
          </button>
          <span className="text-muted small ms-2">
            <i className="bi bi-info-circle me-1"></i>
            복수 선택 가능
          </span>
        </div>
      </div>

      <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto'}}>
        <div className="row g-3">
          {isLoading && coupons.length === 0 ? (
            Array.from({length: skeletonCount}).map((_, idx) => <SkeletonCard key={idx}/>)
          ) : coupons.length === 0 ? (
            <div className="col-12">
              <EmptyState
                icon="bi-ticket-perforated"
                title="등록된 쿠폰이 없습니다"
                description="아직 가게에서 발급한 쿠폰이 없어요."
              />
            </div>
          ) : (
            coupons.map((coupon, index) => {
              const progress = calculateProgress(coupon.currentIssuedCount, coupon.maxIssuableCount);
              const usageRate = coupon.currentIssuedCount > 0
                ? Math.round((coupon.currentUsedCount / coupon.currentIssuedCount) * 100)
                : 0;

              return (
                <div key={coupon.couponId || index} className="col-12">
                  <div className="card border-0 shadow-sm h-100" style={{
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #fffbea 0%, #ffffff 100%)'
                  }}>
                    <div className="card-body p-3 p-md-4">
                      {/* 가게 정보 섹션 */}
                      <div className="mb-3 pb-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                          <div className="flex-grow-1">
                            <div
                              className="d-flex align-items-center gap-2 mb-2 cursor-pointer"
                              onClick={() => handleStoreClick(coupon.store)}
                              style={{cursor: 'pointer'}}
                            >
                              <i className="bi bi-shop text-primary"></i>
                              <h6 className="fw-bold text-primary mb-0 text-decoration-underline">
                                {coupon.store?.name || '가게 이름 없음'}
                              </h6>
                              {getStoreTypeBadge(coupon.store?.storeType)}
                            </div>
                            <div className="d-flex align-items-center gap-2 text-muted small">
                              <i className="bi bi-geo-alt"></i>
                              <span>{coupon.store?.address?.fullAddress || '주소 정보 없음'}</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            {coupon.store?.categories?.slice(0, 2).map((category: any, idx: number) => (
                              <span key={idx}
                                    className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1"
                                    style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-tag me-1"></i>
                                {category.name}
                              </span>
                            ))}
                            {coupon.store?.categories?.length > 2 && (
                              <span
                                className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                                style={{fontSize: '0.7rem'}}>
                                +{coupon.store.categories.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 쿠폰 정보 섹션 */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h6 className="fw-bold text-dark mb-0">{coupon.name}</h6>
                          <span
                            className={`badge ${getCouponStatusBadgeClass(coupon.status)} bg-opacity-10 text-dark border px-3 py-1 rounded-pill`}>
                            <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i>
                            {getCouponStatusDisplayName(coupon.status)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="bi bi-hash"></i>
                          <span>{coupon.couponId}</span>
                        </div>
                      </div>

                      {/* 통계 정보 */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2 p-3 bg-white rounded-3">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="bi bi-ticket-detailed text-primary"></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="text-muted small mb-1">발급 현황</div>
                              <div className="fw-bold text-dark">
                                {coupon.currentIssuedCount.toLocaleString()} / {coupon.maxIssuableCount.toLocaleString()}
                              </div>
                              <div className="progress mt-2" style={{height: '6px'}}>
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{width: `${progress}%`}}
                                  aria-valuenow={progress}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                              <div className="text-muted small mt-1">{progress}% 발급됨</div>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="d-flex align-items-center gap-2 p-3 bg-white rounded-3">
                            <div className="bg-success bg-opacity-10 rounded-circle p-2" style={{
                              width: '40px',
                              height: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="bi bi-check-circle text-success"></i>
                            </div>
                            <div className="flex-grow-1">
                              <div className="text-muted small mb-1">사용 현황</div>
                              <div className="fw-bold text-dark">
                                {coupon.currentUsedCount.toLocaleString()} / {coupon.currentIssuedCount.toLocaleString()}
                              </div>
                              <div className="progress mt-2" style={{height: '6px'}}>
                                <div
                                  className="progress-bar bg-success"
                                  role="progressbar"
                                  style={{width: `${usageRate}%`}}
                                  aria-valuenow={usageRate}
                                  aria-valuemin={0}
                                  aria-valuemax={100}
                                ></div>
                              </div>
                              <div className="text-muted small mt-1">{usageRate}% 사용됨</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 날짜 정보 */}
                      <div className="border-top pt-3">
                        <div className="row g-2">
                          <div className="col-12">
                            <div className="d-flex align-items-center gap-2 p-2 bg-white rounded-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2" style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <i className="bi bi-calendar-range text-primary" style={{fontSize: '0.9rem'}}></i>
                              </div>
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <span className="fw-semibold text-dark">유효 기간:</span>
                                <span
                                  className="text-dark">{formatCouponDate(coupon.validityPeriod.startDateTime)}</span>
                                <i className="bi bi-arrow-right text-muted"></i>
                                <span className="text-dark">{formatCouponDate(coupon.validityPeriod.endDateTime)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-2 text-muted small">
                              <i className="bi bi-clock"></i>
                              <span>생성일: {formatCouponDate(coupon.createdAt)}</span>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-2 text-muted small">
                              <i className="bi bi-clock-history"></i>
                              <span>수정일: {formatCouponDate(coupon.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* 무한 스크롤 트리거 */}
          {hasMore && (
            <div ref={loadMoreRef} className="col-12 text-center py-3">
              {isLoading && (
                <div className="d-flex flex-column align-items-center gap-2">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="text-muted small">쿠폰을 불러오는 중...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && coupons.length > 0 && (
            <div className="col-12 text-center py-3">
              <span className="text-muted small">모든 쿠폰을 불러왔습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 가게 상세 모달 */}
      {selectedStore && (
        <StoreDetailModal
          show={!!selectedStore}
          onHide={() => setSelectedStore(null)}
          store={selectedStore}
          onAuthorClick={null}
          onStoreDeleted={null}
        />
      )}
    </div>
  );
};

export default CouponManagement;
