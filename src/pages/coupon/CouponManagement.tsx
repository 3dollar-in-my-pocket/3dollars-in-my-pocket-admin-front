import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import couponApi from '@/api/couponApi';
import {Coupon, COUPON_STATUS} from '@/types/coupon';
import {formatDateTimeShortKo as formatCouponDate} from '@/utils/dateUtils';
import {getCouponStatusBadgeClass, getCouponStatusDisplayName} from '@/utils/display/couponDisplay';

import StoreDetailModal from '@/pages/store/StoreDetailModal';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';

const STATUS_OPTIONS = [COUPON_STATUS.ACTIVE, COUPON_STATUS.STOPPED, COUPON_STATUS.ENDED];

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 2;

const CouponManagement = () => {
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [skeletonCount] = useState(3);

  const fetchCoupons = useCallback(
    (cursor: string | null) => couponApi.getAllStoreCoupons(
      cursor,
      20,
      selectedStatuses.length > 0 ? selectedStatuses : undefined
    ),
    [selectedStatuses]
  );

  const {
    items: coupons,
    isLoading,
    hasMore,
    refresh,
    loadMore
  } = useCursorPagination<Coupon>({
    fetcher: fetchCoupons,
    deps: [selectedStatuses],
    errorMessage: '쿠폰을 불러오는데 실패했습니다.'
  });

  // Infinite Scroll 훅 사용
  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
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


  const handleStoreClick = (store: any) => {
    setSelectedStore(store);
  };

  // 스켈레톤 로더 컴포넌트
  const SkeletonCard = () => (
    <div className="col-12">
      <div className="item-card">
        <div className="item-card__body">
          <div className="d-flex gap-2 mb-2">
            <div className="skeleton-line" style={{width: '120px'}}/>
            <div className="skeleton-line" style={{width: '80px'}}/>
          </div>
          <div className="skeleton-line mb-2" style={{width: '60%'}}/>
          <div className="skeleton-line" style={{width: '100%', height: '72px'}}/>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader
        description="전체 가게에 등록된 쿠폰의 발급·사용 현황을 조회합니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <FilterCard title="쿠폰 상태" icon="bi-funnel" aside={<span className="small text-secondary">복수 선택 가능</span>}>
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${selectedStatuses.length === 0 ? 'filter-chip--active' : ''}`}
            onClick={() => setSelectedStatuses([])}
            disabled={isLoading}
          >
            전체
          </button>
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              className={`filter-chip ${selectedStatuses.includes(status) ? 'filter-chip--active' : ''}`}
              onClick={() => handleStatusToggle(status)}
              disabled={isLoading}
            >
              {getCouponStatusDisplayName(status)}
            </button>
          ))}
        </div>
      </FilterCard>

      <SectionCard
        title="쿠폰 목록"
        icon="bi-ticket-perforated-fill"
        aside={coupons.length > 0 && (
          <span className="page-count">{coupons.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 340px)', overflowY: 'auto'}}>
          <div className="row g-3">
            {isLoading && coupons.length === 0 ? (
              Array.from({length: skeletonCount}).map((_, idx) => <SkeletonCard key={idx}/>)
            ) : coupons.length === 0 ? (
              <div className="col-12">
                <EmptyState
                  icon="bi-ticket-perforated"
                  title="등록된 쿠폰이 없습니다"
                  description="아직 가게에서 발급한 쿠폰이 없습니다."
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
                    <div className="item-card">
                      <div className="item-card__body">
                        {/* 가게 정보 */}
                        <div className="d-flex align-items-start justify-content-between gap-2 pb-2 mb-3 border-bottom">
                          <div className="min-w-0">
                            <button
                              type="button"
                              className="btn btn-link p-0 text-start item-card__name text-decoration-none"
                              onClick={() => handleStoreClick(coupon.store)}
                            >
                              <i className="bi bi-shop me-1"/>
                              {coupon.store?.name || '가게 이름 없음'}
                              <i className="bi bi-box-arrow-up-right ms-1 small"/>
                            </button>
                            <p className="item-card__desc mb-0">
                              <i className="bi bi-geo-alt me-1"/>
                              {coupon.store?.address?.fullAddress || '주소 정보 없음'}
                            </p>
                          </div>
                          <div className="form-chips mt-0 flex-shrink-0 justify-content-end">
                            <StoreTypeBadge storeType={coupon.store?.storeType}/>
                            {coupon.store?.categories?.slice(0, VISIBLE_CATEGORIES).map((category: any, idx: number) => (
                              <span key={idx} className="form-chip">{category.name}</span>
                            ))}
                            {coupon.store?.categories?.length > VISIBLE_CATEGORIES && (
                              <span className="form-chip">
                                +{coupon.store.categories.length - VISIBLE_CATEGORIES}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 쿠폰 정보 */}
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <h3 className="item-card__name mb-0">{coupon.name}</h3>
                          <span className={`badge ${getCouponStatusBadgeClass(coupon.status)}`}>
                            {getCouponStatusDisplayName(coupon.status)}
                          </span>
                          <span className="item-card__desc font-monospace">#{coupon.couponId}</span>
                        </div>

                        {/* 발급 / 사용 현황 */}
                        <div className="row g-3 mt-2">
                          <div className="col-12 col-md-6">
                            <div className="stat-tile">
                              <span className="stat-tile__label">발급 현황</span>
                              <span className="stat-tile__value">
                                {coupon.currentIssuedCount.toLocaleString()}
                                <span className="text-secondary fw-normal fs-6">
                                  {' / '}{coupon.maxIssuableCount.toLocaleString()}
                                </span>
                              </span>
                              <div className="meter mt-1">
                                <div className="meter__fill" style={{width: `${progress}%`}}/>
                              </div>
                              <span className="stat-tile__label">{progress}% 발급</span>
                            </div>
                          </div>

                          <div className="col-12 col-md-6">
                            <div className="stat-tile">
                              <span className="stat-tile__label">사용 현황</span>
                              <span className="stat-tile__value">
                                {coupon.currentUsedCount.toLocaleString()}
                                <span className="text-secondary fw-normal fs-6">
                                  {' / '}{coupon.currentIssuedCount.toLocaleString()}
                                </span>
                              </span>
                              <div className="meter mt-1">
                                <div className="meter__fill meter__fill--success" style={{width: `${usageRate}%`}}/>
                              </div>
                              <span className="stat-tile__label">{usageRate}% 사용</span>
                            </div>
                          </div>
                        </div>

                        {/* 기간 정보 */}
                        <div className="form-summary mt-3 pt-2 border-top">
                          <div className="form-summary__row">
                            <span className="form-summary__label">유효 기간</span>
                            <span className="form-summary__value">
                              {formatCouponDate(coupon.validityPeriod.startDateTime)}
                              {' ~ '}
                              {formatCouponDate(coupon.validityPeriod.endDateTime)}
                            </span>
                          </div>
                          <div className="form-summary__row">
                            <span className="form-summary__label">생성 / 수정</span>
                            <span className="form-summary__value form-summary__value--muted">
                              {formatCouponDate(coupon.createdAt)} / {formatCouponDate(coupon.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* 무한 스크롤 트리거 - 항상 렌더링 */}
            <div
              ref={loadMoreRef}
              className="col-12 text-center py-3"
              style={{display: hasMore ? 'block' : 'none'}}
            >
              {isLoading && (
                <>
                  <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
                  <span className="small text-muted">쿠폰을 불러오는 중...</span>
                </>
              )}
            </div>

            {!hasMore && coupons.length > 0 && (
              <p className="col-12 text-center text-secondary small mb-0">
                <i className="bi bi-check-circle me-1"/>
                모든 쿠폰을 불러왔습니다.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

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
