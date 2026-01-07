import React, {useState, useEffect} from 'react';
import storeApi from '../api/storeApi';
import {Coupon, getCouponStatusDisplayName, getCouponStatusBadgeClass, formatCouponDate} from '../types/coupon';

interface StoreCouponHistoryProps {
  storeId: string;
}

const StoreCouponHistory: React.FC<StoreCouponHistoryProps> = ({storeId}) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeId) {
      fetchCoupons(true);
    }
  }, [storeId]);

  const fetchCoupons = async (isInitial = false) => {
    if (isInitial) {
      setIsLoading(true);
      setCoupons([]);
      setNextCursor(null);
      setHasMore(true);
      setError(null);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await storeApi.getStoreCoupons(storeId, isInitial ? null : nextCursor, 20);

      if (!response.ok) {
        throw new Error('쿠폰을 불러오는데 실패했습니다.');
      }

      const {contents, cursor} = response.data;

      if (isInitial) {
        setCoupons(contents || []);
      } else {
        setCoupons(prev => [...prev, ...(contents || [])]);
      }

      setHasMore(cursor?.hasMore || false);
      setNextCursor(cursor?.nextCursor || null);
    } catch (error: any) {
      console.error('가게 쿠폰 조회 실패:', error);
      const errorMessage = error.response?.status
        ? `서버 오류가 발생했습니다. (${error.response.status})`
        : '쿠폰을 불러오는데 실패했습니다. 인터넷 연결을 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore && nextCursor) {
      fetchCoupons(false);
    }
  };

  const calculateProgress = (issued: number, max: number): number => {
    if (max === 0) return 0;
    return Math.round((issued / max) * 100);
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="mb-3">
          <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <h5 className="text-dark mb-1">쿠폰을 불러오는 중...</h5>
        <p className="text-muted">잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5 text-danger">
        <div className="mb-4">
          <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
          </div>
        </div>
        <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
        <p className="text-muted mb-3">{error}</p>
        <button
          className="btn btn-outline-primary rounded-pill px-4"
          onClick={() => fetchCoupons(true)}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          다시 시도
        </button>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="bg-light rounded-circle mx-auto mb-3"
             style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <i className="bi bi-ticket-perforated fs-1 text-secondary"></i>
        </div>
        <h5 className="text-dark mb-2">등록된 쿠폰이 없습니다</h5>
        <p className="text-muted">아직 가게에서 발급한 쿠폰이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-ticket-perforated text-warning"></i>
          </div>
          <h5 className="mb-0 fw-bold text-dark">쿠폰 목록</h5>
          <span className="badge bg-warning ms-2 px-3 py-2 rounded-pill">
            {coupons.length}{hasMore ? '+' : ''}개
          </span>
        </div>
        <button
          className="btn btn-outline-secondary btn-sm rounded-pill"
          onClick={() => fetchCoupons(true)}
          disabled={isLoading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          새로고침
        </button>
      </div>

      <div className="row g-3">
        {coupons.map((coupon, index) => {
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
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-bold text-dark mb-0">{coupon.name}</h6>
                        <span
                          className={`badge ${getCouponStatusBadgeClass(coupon.status)} bg-opacity-10 text-dark border px-3 py-1 rounded-pill`}>
                          <i className="bi bi-circle-fill me-1" style={{fontSize: '0.5rem'}}></i>
                          {getCouponStatusDisplayName(coupon.status)}
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <div className="border-top pt-3">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="bi bi-calendar-event"></i>
                          <span>유효 기간 시작: {formatCouponDate(coupon.validityPeriod.startDateTime)}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 text-muted small">
                          <i className="bi bi-calendar-x"></i>
                          <span>유효 기간 종료: {formatCouponDate(coupon.validityPeriod.endDateTime)}</span>
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
        })}
      </div>

      {hasMore && (
        <div className="text-center mt-4">
          <button
            className="btn btn-outline-primary rounded-pill px-4 py-2"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                불러오는 중...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-down-circle me-2"></i>
                더보기
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreCouponHistory;
