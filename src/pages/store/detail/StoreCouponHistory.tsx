import {getCouponStatusDisplayName} from '@/utils/display/couponDisplay';
import {formatDateTimeShortKo as formatCouponDate} from '@/utils/dateUtils';
import React, {useCallback} from 'react';
import storeApi from '@/api/storeApi';
import {Coupon} from '@/types/coupon';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';

interface StoreCouponHistoryProps {
  storeId: string;
}

const StoreCouponHistory: React.FC<StoreCouponHistoryProps> = ({storeId}) => {
  const fetchCoupons = useCallback(
    (cursor: string | null) => storeApi.getStoreCoupons(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: coupons,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore: handleLoadMore
  } = useCursorPagination<Coupon>({
    fetcher: fetchCoupons,
    enabled: Boolean(storeId),
    deps: [storeId],
    errorMessage: '쿠폰을 불러오는데 실패했습니다.'
  });

  const calculateProgress = (issued: number, max: number): number => {
    if (max === 0) return 0;
    return Math.round((issued / max) * 100);
  };

  return (
    <HistoryPanel
      title="쿠폰 목록"
      icon="bi-ticket-perforated"
      count={coupons.length}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={handleLoadMore}
      emptyTitle="등록된 쿠폰이 없습니다"
      emptyDescription="아직 가게에서 발급한 쿠폰이 없어요."
    >
      {coupons.map((coupon, index) => {
        const progress = calculateProgress(coupon.currentIssuedCount, coupon.maxIssuableCount);
        const usageRate = coupon.currentIssuedCount > 0
          ? Math.round((coupon.currentUsedCount / coupon.currentIssuedCount) * 100)
          : 0;

        return (
          <div key={coupon.couponId || index} className="item-card mb-3">
            <div className="item-card__body">
              <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                <h3 className="item-card__name">{coupon.name}</h3>
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  {getCouponStatusDisplayName(coupon.status)}
                </span>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <div className="item-card__field">
                    <span className="item-card__label">발급 현황</span>
                    <div className="item-card__value">
                      {coupon.currentIssuedCount.toLocaleString()} / {coupon.maxIssuableCount.toLocaleString()}
                    </div>
                    <div className="meter mt-2">
                      <div
                        className="meter__fill"
                        role="progressbar"
                        style={{width: `${progress}%`}}
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="item-card__desc">{progress}% 발급됨</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="item-card__field">
                    <span className="item-card__label">사용 현황</span>
                    <div className="item-card__value">
                      {coupon.currentUsedCount.toLocaleString()} / {coupon.currentIssuedCount.toLocaleString()}
                    </div>
                    <div className="meter mt-2">
                      <div
                        className="meter__fill meter__fill--success"
                        role="progressbar"
                        style={{width: `${usageRate}%`}}
                        aria-valuenow={usageRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                    <p className="item-card__desc">{usageRate}% 사용됨</p>
                  </div>
                </div>
              </div>

              <div className="row g-2 mt-2">
                <div className="col-md-6">
                  <p className="item-card__desc mt-0">
                    <i className="bi bi-calendar-event me-1"/>
                    유효 기간 시작: {formatCouponDate(coupon.validityPeriod.startDateTime)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="item-card__desc mt-0">
                    <i className="bi bi-calendar-x me-1"/>
                    유효 기간 종료: {formatCouponDate(coupon.validityPeriod.endDateTime)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="item-card__desc mt-0">
                    <i className="bi bi-clock me-1"/>
                    생성일: {formatCouponDate(coupon.createdAt)}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="item-card__desc mt-0">
                    <i className="bi bi-clock-history me-1"/>
                    수정일: {formatCouponDate(coupon.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </HistoryPanel>
  );
};

export default StoreCouponHistory;
