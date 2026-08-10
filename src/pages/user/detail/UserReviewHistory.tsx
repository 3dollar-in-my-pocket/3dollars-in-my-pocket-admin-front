import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {toast} from 'react-toastify';
import {getActivitiesStatusBadgeClass, getActivitiesStatusDisplayName} from '@/utils/display/storeDisplay';

import reviewApi from "@/api/reviewApi";
import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {Review, ReviewStatus} from "@/types/review";
import {ActivitiesStatus, SimpleStore} from "@/types/store";
import {formatDateTimeKo as formatDateTime} from "@/utils/dateUtils";

interface UserReviewHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserReviewHistory = ({userId, isActive, onStoreClick}: UserReviewHistoryProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserReviews = useCallback(
    (cursor: string | null) => reviewApi.getUserReviews(userId, cursor, 20),
    [userId]
  );

  const {
    items: reviews,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore
  } = useCursorPagination<Review>({
    fetcher: fetchUserReviews,
    enabled: Boolean(userId && isActive),
    deps: [userId]
  });

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
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

  const getReviewStatusBadge = (status?: ReviewStatus) => {
    if (!status) return null;

    let badgeClass, statusText, iconClass;

    switch (status) {
      case 'POSTED':
        badgeClass = 'bg-success-subtle text-success-emphasis';
        statusText = '활성화된 리뷰';
        iconClass = 'bi-check-circle';
        break;
      case 'FILTERED':
        badgeClass = 'bg-warning-subtle text-warning-emphasis';
        statusText = '블라인드된 리뷰';
        iconClass = 'bi-eye-slash';
        break;
      case 'DELETED':
        badgeClass = 'bg-danger-subtle text-danger-emphasis';
        statusText = '삭제된 리뷰';
        iconClass = 'bi-x-circle';
        break;
      default:
        badgeClass = 'bg-secondary-subtle text-secondary-emphasis';
        statusText = '알 수 없음';
        iconClass = 'bi-question-circle';
    }

    return (
      <span className={`badge ${badgeClass}`}>
        <i className={`bi ${iconClass} me-1`}/>
        {statusText}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
        />
      );
    }
    return stars;
  };

  // 리뷰 삭제 핸들러
  const handleDeleteReview = async () => {
    if (!selectedReview) return;
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const response = await reviewApi.blindStoreReview(selectedReview.reviewId);
      if (!response.ok) {
        return;
      }
      toast.success('리뷰가 성공적으로 삭제되었습니다.');
      handleCloseModal();
      refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <HistoryPanel
        title="작성한 리뷰"
        icon="bi-chat-square-text"
        count={reviews.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="작성한 리뷰가 없습니다"
        emptyDescription="아직 작성한 리뷰가 없습니다."
      >
        {reviews.map((review) => (
          <div
            key={review.reviewId}
            className="item-card item-card--clickable mb-3"
            role="button"
            tabIndex={0}
            onClick={() => handleReviewClick(review)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleReviewClick(review);
              }
            }}
          >
            <div className="item-card__body">
              <div className="d-flex align-items-start justify-content-between gap-2">
                <div className="min-w-0">
                  <div className="d-flex align-items-center flex-wrap gap-2">
                    {review.store && onStoreClick ? (
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStoreClick(review.store);
                        }}
                      >
                        {review.store.name || '가게 이름 없음'}
                        <i className="bi bi-box-arrow-up-right ms-1"/>
                      </button>
                    ) : (
                      <h3 className="item-card__name">{review.store?.name || '가게 이름 없음'}</h3>
                    )}
                    {getReviewStatusBadge(review.status)}
                    <StoreStatusBadge status={review.store?.status}/>
                    {review.store?.storeType && <StoreTypeBadge storeType={review.store.storeType}/>}
                  </div>
                  <p className="item-card__desc">
                    <i className="bi bi-geo-alt me-1"/>
                    {review.store?.address?.fullAddress || '주소 정보 없음'}
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewClick(review);
                  }}
                >
                  <i className="bi bi-eye me-1"/>
                  상세보기
                </button>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                <span className="rating-badge">
                  {renderStars(review.rating)}
                  {review.rating}점
                </span>
                {review.store?.categories?.slice(0, 2).map((category, idx) => (
                  <span key={idx} className="badge bg-secondary-subtle text-secondary-emphasis">
                    {category?.name || '카테고리'}
                  </span>
                ))}
                {review.store?.categories && review.store.categories.length > 2 && (
                  <span className="badge bg-secondary-subtle text-secondary-emphasis">
                    +{review.store.categories.length - 2}
                  </span>
                )}
              </div>

              <div className="detail-value-strong detail-value-strong--text mt-2">
                {review.contents || '리뷰 내용이 없습니다.'}
              </div>

              {review.images && review.images.length > 0 && (
                <div className="row g-2 mt-2">
                  {review.images.slice(0, 3).map((image, idx) => (
                    <div key={idx} className="col-4 col-md-3">
                      <div className="store-post__image position-relative" style={{aspectRatio: 1}}>
                        <img
                          src={image.imageUrl}
                          alt={`리뷰 이미지 ${idx + 1}`}
                          loading="lazy"
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {idx === 2 && review.images.length > 3 && (
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 text-white small">
                            +{review.images.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {review.createdAt && (
                <p className="item-card__desc">
                  <i className="bi bi-clock me-1"/>
                  작성일: {formatDateTime(review.createdAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </HistoryPanel>

      {/* 리뷰 상세 모달 */}
      {showModal && selectedReview && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-square-text text-primary me-2"/>
                  리뷰 상세 정보
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={isDeleting}/>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게명</label>
                    <p className="form-control-plaintext">{selectedReview.store?.name || '가게 이름 없음'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">리뷰 평점</label>
                    <div>
                      <span className="rating-badge">
                        {renderStars(selectedReview.rating)}
                        {selectedReview.rating ? selectedReview.rating.toFixed(1) : '0.0'}점
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">주소</label>
                    <p className="form-control-plaintext">
                      {selectedReview.store?.address?.fullAddress || '주소 정보 없음'}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">리뷰 상태</label>
                    <div>
                      {getReviewStatusBadge(selectedReview.status)}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">가게 상태</label>
                    <div className="d-flex gap-2 flex-wrap">
                      <StoreStatusBadge status={selectedReview.store?.status}/>
                      {getActivitiesStatusBadge(selectedReview.store?.activitiesStatus)}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">가게 카테고리</label>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedReview.store?.categories?.map((category, idx) => (
                        <span key={idx} className="badge bg-primary-subtle text-primary-emphasis">
                          {category?.name || '카테고리'}
                        </span>
                      )) || <span className="text-muted">카테고리 정보 없음</span>}
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">리뷰 내용</label>
                    <div className="detail-value-strong detail-value-strong--text">
                      {selectedReview.contents || '리뷰 내용이 없습니다.'}
                    </div>
                  </div>
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold">리뷰 이미지 ({selectedReview.images.length}개)</label>
                      <div className="row g-2">
                        {selectedReview.images.map((image, idx) => (
                          <div key={idx} className="col-6 col-md-4">
                            <div className="store-post__image" style={{aspectRatio: 1}}>
                              <img
                                src={image.imageUrl}
                                alt={`리뷰 이미지 ${idx + 1}`}
                                loading="lazy"
                                onError={(e: any) => {
                                  e.target.src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">등록일시</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedReview.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">수정일시</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedReview.updatedAt)}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteReview}
                  disabled={isDeleting || selectedReview?.status !== 'POSTED'}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                      블라인드 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-eye-slash me-2"/>
                      리뷰 블라인드
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isDeleting}>
                  <i className="bi bi-x-lg me-2"/>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserReviewHistory;
