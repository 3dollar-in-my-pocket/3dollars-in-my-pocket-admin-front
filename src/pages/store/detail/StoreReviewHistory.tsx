import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {toast} from 'react-toastify';
import reviewApi from "@/api/reviewApi";

import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {Review} from "@/types/review";
import {ActivityAuthor} from "@/types/domain";
import {formatDateTimeShortKo as formatDateTime} from "@/utils/dateUtils";

interface StoreReviewHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 작성자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

const StoreReviewHistory = ({storeId, isActive, onAuthorClick}: StoreReviewHistoryProps) => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isBlinding, setIsBlinding] = useState(false);

  const fetchReviews = useCallback(
    (cursor: string | null) => reviewApi.getStoreReviews(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: reviews,
    isLoading,
    isLoadingMore,
    totalCount,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<Review>({
    fetcher: fetchReviews,
    enabled: Boolean(storeId && isActive),
    deps: [storeId],
    errorMessage: '리뷰를 불러오는데 실패했습니다.'
  });

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-muted"></i>);
    }

    return stars;
  };

  const getReviewStatusBadgeClass = (status?: string) => {
    if (status === 'POSTED') return 'bg-success-subtle text-success-emphasis';
    if (status === 'DELETED') return 'bg-danger-subtle text-danger-emphasis';
    if (status === 'FILTERED') return 'bg-warning-subtle text-warning-emphasis';
    return 'bg-secondary-subtle text-secondary-emphasis';
  };

  const getReviewStatusIcon = (status?: string) => {
    if (status === 'POSTED') return 'bi-eye-fill';
    if (status === 'DELETED') return 'bi-trash-fill';
    if (status === 'FILTERED') return 'bi-eye-slash-fill';
    return 'bi-question-circle-fill';
  };

  const getReviewStatusText = (status?: string) => {
    if (status === 'POSTED') return '활성';
    if (status === 'DELETED') return '삭제됨';
    if (status === 'FILTERED') return '블라인드';
    return '알 수 없음';
  };

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleBlindReview = async () => {
    const confirmed = window.confirm(`정말로 이 리뷰를 블라인드 처리하시겠습니까?\n\n작성자: ${selectedReview.writer?.name || '익명 사용자'}\n내용: ${selectedReview.contents?.substring(0, 50)}...\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) return;

    setIsBlinding(true);
    try {
      const response = await reviewApi.blindStoreReview(selectedReview.reviewId);

      if (response.ok) {
        toast.success('리뷰가 성공적으로 블라인드 처리되었습니다.');
        setShowModal(false);
        // 리뷰 목록 새로고침
        refresh();
      }
    } finally {
      setIsBlinding(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <>
      <HistoryPanel
        title="리뷰"
        icon="bi-chat-square-text"
        count={reviews.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="등록된 리뷰가 없습니다"
        emptyDescription="아직 이 가게에 작성된 리뷰가 없습니다."
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
              <div className="d-flex align-items-center justify-content-between gap-2">
                <div className="d-flex align-items-center flex-wrap gap-2 min-w-0">
                  <span className="item-card__desc mt-0">작성자</span>
                  {review.writer && onAuthorClick ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAuthorClick(review.writer);
                      }}
                    >
                      {review.writer.name}
                      <i className="bi bi-box-arrow-up-right ms-1"/>
                    </button>
                  ) : (
                    <h3 className="item-card__name">{review.writer?.name || '익명 사용자'}</h3>
                  )}
                  <span className={`badge ${getReviewStatusBadgeClass(review.status)}`}>
                    <i className={`bi ${getReviewStatusIcon(review.status)} me-1`}/>
                    {getReviewStatusText(review.status)}
                  </span>
                </div>
                <span className="item-card__desc mt-0 flex-shrink-0">
                  <i className="bi bi-clock me-1"/>
                  {formatDateTime(review.createdAt)}
                </span>
              </div>

              <div className="d-flex align-items-center flex-wrap gap-2 mt-2">
                <span className="rating-badge">
                  {getRatingStars(review.rating)}
                  {review.rating?.toFixed(1)}점
                </span>
                {review.store?.storeType && <StoreTypeBadge storeType={review.store.storeType}/>}
              </div>

              {review.contents && (
                <div className="detail-value-strong detail-value-strong--text mt-2">
                  {review.contents.length > 100
                    ? `${review.contents.substring(0, 100)}...`
                    : review.contents
                  }
                </div>
              )}

              {/* 리뷰 이미지들 */}
              {review.images && review.images.length > 0 && (
                <div className="row g-2 mt-2">
                  {review.images.slice(0, 3).map((image, imgIndex) => (
                    <div key={imgIndex} className="col-4 col-md-3">
                      <div className="store-post__image position-relative" style={{aspectRatio: 1}}>
                        <img
                          src={image.imageUrl}
                          alt={`리뷰 이미지 ${imgIndex + 1}`}
                          loading="lazy"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReviewClick(review);
                          }}
                          onError={(e: any) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {imgIndex === 2 && review.images.length > 3 && (
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

              <div className="d-flex justify-content-end mt-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReviewClick(review);
                  }}
                >
                  <i className="bi bi-eye me-1"/>
                  상세보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </HistoryPanel>

      {/* 리뷰 상세 모달 */}
      {showModal && selectedReview && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-chat-square-text text-primary me-2"></i>
                  리뷰 상세 정보
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">작성자</label>
                    <p className="form-control-plaintext">{selectedReview.writer?.name || '익명 사용자'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">평균 평점</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className="rating-badge">
                        {getRatingStars(selectedReview.rating)}
                        {selectedReview.rating?.toFixed(1)}점
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">작성일</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedReview.createdAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">수정일</label>
                    <p className="form-control-plaintext">{formatDateTime(selectedReview.updatedAt)}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">리뷰 내용</label>
                    <div className="detail-value-strong detail-value-strong--text">
                      {selectedReview.contents || '내용이 없습니다.'}
                    </div>
                  </div>
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold">첨부 이미지 ({selectedReview.images.length}개)</label>
                      <div className="row g-2">
                        {selectedReview.images.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="item-card">
                              <div className="store-post__image" style={{aspectRatio: 1}}>
                                <img
                                  src={image.imageUrl}
                                  alt={`리뷰 이미지 ${index + 1}`}
                                  loading="lazy"
                                  onClick={() => window.open(image.imageUrl, '_blank')}
                                  onError={(e: any) => {
                                    e.target.style.objectFit = 'contain';
                                  }}
                                />
                              </div>
                              <div className="item-card__body">
                                <span className="item-card__desc mt-0">
                                  {image.width} × {image.height}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">작성자 정보</label>
                    <div className="d-flex gap-2 flex-wrap">
                      <span className="badge bg-info-subtle text-info-emphasis">
                        <i className="bi bi-hash me-1"/>
                        {selectedReview.writer?.userId || '없음'}
                      </span>
                      <span className="badge bg-secondary-subtle text-secondary-emphasis">
                        <i className="bi bi-share me-1"/>
                        {selectedReview.writer?.socialType || '없음'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 타입</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedReview.store?.storeType ? (
                        <StoreTypeBadge storeType={selectedReview.store.storeType}/>
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                      {selectedReview.store?.name && (
                        <span className="badge bg-light text-dark border">
                          <i className="bi bi-shop me-1"/>
                          {selectedReview.store.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-danger"
                  onClick={handleBlindReview}
                  disabled={isBlinding}
                >
                  {isBlinding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      블라인드 처리 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-eye-slash me-2"/>
                      리뷰 블라인드
                    </>
                  )}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default StoreReviewHistory;
