import { useState, useEffect, useRef, useCallback } from 'react';
import userApi from '../api/userApi';
import { toast } from 'react-toastify';

const UserReviewHistory = ({ userId }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchReviews(true);
    }
  }, [userId]);

  const fetchReviews = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await userApi.getUserReviews(userId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('리뷰 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const { contents = [], cursor: newCursor = {} } = response.data || {};

      if (reset) {
        setReviews(contents);
      } else {
        setReviews(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('리뷰 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchReviews(false);
    }
  }, [hasMore, isLoading, fetchReviews]);

  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading, handleLoadMore]);

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  const getSalesTypeBadge = (salesType) => {
    if (!salesType) return null;
    const badgeClass = salesType.type === 'ROAD' ? 'bg-success' :
                      salesType.type === 'STORE' ? 'bg-primary' : 'bg-secondary';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {salesType.description || salesType.type}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE' ? 'bg-success' :
                      status === 'DELETED' ? 'bg-danger' :
                      status === 'AUTO_DELETED' ? 'bg-warning' : 'bg-secondary';
    const statusText = status === 'ACTIVE' ? '활성화 중' :
                      status === 'DELETED' ? '삭제됨' :
                      status === 'AUTO_DELETED' ? '자동 삭제됨' : '알 수 없음';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };

  const getActivitiesStatusBadge = (activitiesStatus) => {
    if (!activitiesStatus) return null;
    const badgeClass = activitiesStatus === 'RECENT_ACTIVITY' ? 'bg-info' :
                      activitiesStatus === 'NO_RECENT_ACTIVITY' ? 'bg-secondary' : 'bg-light';
    const statusText = activitiesStatus === 'RECENT_ACTIVITY' ? '최근 활동' :
                      activitiesStatus === 'NO_RECENT_ACTIVITY' ? '활동 없음' : '알 수 없음';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1 small`}>
        {statusText}
      </span>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i
          key={i}
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
        ></i>
      );
    }
    return stars;
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 px-4 pt-4">
        <div className="d-flex align-items-center gap-2">
          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-chat-square-text text-primary"></i>
          </div>
          <h6 className="mb-0 fw-bold text-dark">작성한 리뷰</h6>
        </div>
        {totalCount > 0 && (
          <span className="badge bg-primary px-3 py-2 rounded-pill">
            총 {totalCount}개
          </span>
        )}
      </div>

      <div
        className="px-4"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      >
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <i className="bi bi-chat-square-text fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">작성한 리뷰가 없습니다</h5>
            <p className="text-muted">아직 작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div>
            {reviews.map((review, index) => (
              <div key={review.reviewId}>
                <div
                  className="review-item p-3 border-bottom bg-white"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: '4px solid #0d6efd'
                  }}
                  onClick={() => handleReviewClick(review)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="mb-0 fw-bold text-dark">{review.store?.name || '가게 이름 없음'}</h6>
                        {getSalesTypeBadge(review.store?.salesType)}
                        {getStatusBadge(review.store?.status)}
                        {getActivitiesStatusBadge(review.store?.activitiesStatus)}
                      </div>

                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div className="d-flex align-items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-muted small">({review.rating}점)</span>
                      </div>

                      <div className="text-muted small mb-2">
                        <i className="bi bi-geo-alt me-1"></i>
                        {review.store?.address?.fullAddress || '주소 정보 없음'}
                      </div>

                      <div className="text-dark mb-2">
                        <p className="mb-0" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {review.contents || '리뷰 내용이 없습니다.'}
                        </p>
                      </div>

                      {review.images && review.images.length > 0 && (
                        <div className="d-flex gap-1 mb-2">
                          {review.images.slice(0, 3).map((image, idx) => (
                            <div key={idx} className="position-relative">
                              <img
                                src={image.imageUrl}
                                alt={`리뷰 이미지 ${idx + 1}`}
                                className="rounded"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                          {review.images.length > 3 && (
                            <div className="d-flex align-items-center justify-content-center rounded bg-light"
                                 style={{ width: '40px', height: '40px' }}>
                              <span className="text-muted small">+{review.images.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="d-flex flex-wrap gap-1">
                        {review.store?.categories?.slice(0, 2).map((category, idx) => (
                          <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary border rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            {category?.name || '카테고리'}
                          </span>
                        ))}
                        {review.store?.categories && review.store.categories.length > 2 && (
                          <span className="badge bg-light text-muted border rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            +{review.store.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReviewClick(review);
                        }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        상세보기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && reviews.length > 0 && (
          <div className="text-center p-3 bg-light">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">추가 데이터 로딩 중...</p>
          </div>
        )}

        {isLoading && reviews.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">리뷰를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요...</p>
          </div>
        )}
      </div>

      {/* 리뷰 상세 모달 */}
      {showModal && selectedReview && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6610f2 100%)' }}>
                <div className="w-100">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div>
                      <h4 className="mb-0 fw-bold">{selectedReview?.store?.name || '가게 이름 없음'}</h4>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <div className="d-flex align-items-center">
                          {renderStars(selectedReview.rating)}
                        </div>
                        <span className="opacity-90">({selectedReview.rating}점)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-geo-alt text-primary"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">주소</label>
                        <p className="mb-0 text-dark">{selectedReview?.store?.address?.fullAddress || '주소 정보 없음'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-star text-warning"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">가게 평점</label>
                        <p className="mb-0 text-dark fw-bold">{selectedReview?.store?.rating ? selectedReview.store.rating.toFixed(1) : '0.0'}점</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                      <div className="bg-success bg-opacity-10 rounded-circle p-2">
                        <i className="bi bi-shield-check text-success"></i>
                      </div>
                      <div>
                        <label className="form-label fw-semibold text-muted mb-1">가게 상태</label>
                        <div className="d-flex gap-2">
                          {getSalesTypeBadge(selectedReview?.store?.salesType)}
                          {getStatusBadge(selectedReview?.store?.status)}
                          {getActivitiesStatusBadge(selectedReview?.store?.activitiesStatus)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h6 className="fw-bold text-dark mb-3">리뷰 내용</h6>
                  <div className="p-3 bg-light rounded-3">
                    <p className="mb-0 text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {selectedReview?.contents || '리뷰 내용이 없습니다.'}
                    </p>
                  </div>
                </div>

                {selectedReview?.images && selectedReview.images.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold text-dark mb-3">리뷰 이미지</h6>
                    <div className="row g-3">
                      {selectedReview.images.map((image, idx) => (
                        <div key={idx} className="col-md-4">
                          <div className="position-relative">
                            <img
                              src={image.imageUrl}
                              alt={`리뷰 이미지 ${idx + 1}`}
                              className="img-fluid rounded shadow-sm"
                              style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4">
                  <h6 className="fw-bold text-dark mb-3">가게 카테고리</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedReview?.store?.categories?.map((category, idx) => (
                      <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border rounded-pill px-3 py-2">
                        {category?.name || '카테고리'}
                      </span>
                    )) || <span className="text-muted">카테고리 정보 없음</span>}
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={handleCloseModal}>
                  <i className="bi bi-x-lg me-2"></i>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReviewHistory;