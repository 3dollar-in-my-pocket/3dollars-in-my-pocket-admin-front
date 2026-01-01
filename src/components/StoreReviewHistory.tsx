import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import reviewApi from "../api/reviewApi";
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from "../types/store";

const StoreReviewHistory = ({storeId, isActive, onAuthorClick}) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isBlinding, setIsBlinding] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (storeId && isActive) {
      fetchReviews(true);
    }
  }, [storeId, isActive]);

  const fetchReviews = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await reviewApi.getStoreReviews(storeId, reset ? null : cursor, 20);
      if (!response?.ok) {
        return;
      }

      const {contents = [], cursor: newCursor} = response.data || { contents: [], cursor: { hasMore: false, nextCursor: null } };

      if (reset) {
        setReviews(contents);
      } else {
        setReviews(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchReviews(false);
    }
  }, [hasMore, isLoading, fetchReviews]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating) => {
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

  const getStoreTypeBadge = (storeType) => {
    if (!storeType) return null;
    return (
      <span className={`badge ${getStoreTypeBadgeClass(storeType)} text-white rounded-pill px-2 py-1 small`}>
        <i className={`bi ${getStoreTypeIcon(storeType)} me-1`}></i>
        {getStoreTypeDisplayName(storeType)}
      </span>
    );
  };

  const handleReviewClick = (review) => {
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
        fetchReviews(true);
      }
    } finally {
      setIsBlinding(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-2">
          {totalCount > 0 && (
            <span className="badge bg-primary rounded-pill">
              {totalCount.toLocaleString()}개
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <button
            className="btn btn-outline-primary btn-sm rounded-pill px-3"
            onClick={() => fetchReviews(true)}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            새로고침
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="review-container"
        style={{maxHeight: '600px', overflowY: 'auto'}}
      >
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-chat-square-text fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">등록된 리뷰가 없습니다</h5>
            <p className="text-muted">아직 이 가게에 작성된 리뷰가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {reviews.map((review) => (
              <div key={review.reviewId} className="col-12">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                  }}
                  onClick={() => handleReviewClick(review)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <div className="d-flex align-items-center gap-2">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-1">
                                  <i className="bi bi-person-fill text-primary" style={{fontSize: '0.8rem'}}></i>
                                </div>
                                <div
                                  className={`d-flex align-items-center gap-1 ${review.writer && onAuthorClick ? 'clickable-author' : ''}`}
                                  style={{
                                    cursor: review.writer && onAuthorClick ? 'pointer' : 'default',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
                                    backgroundColor: 'transparent'
                                  }}
                                  onClick={(e) => {
                                    if (review.writer && onAuthorClick) {
                                      e.stopPropagation();
                                      onAuthorClick(review.writer);
                                    }
                                  }}
                                  onMouseEnter={(e: any) => {
                                    if (review.writer && onAuthorClick) {
                                      e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                      e.currentTarget.style.transform = 'scale(1.02)';
                                    }
                                  }}
                                  onMouseLeave={(e: any) => {
                                    if (review.writer && onAuthorClick) {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }
                                  }}
                                >
                                  <span className="text-muted small">작성자:</span>
                                  <h6
                                    className={`fw-bold mb-0 ${review.writer && onAuthorClick ? 'text-primary' : 'text-dark'}`}>
                                    {review.writer?.name || '익명 사용자'}
                                  </h6>
                                  {review.writer && onAuthorClick && (
                                    <i className="bi bi-box-arrow-up-right text-primary"
                                       style={{fontSize: '0.7rem'}}></i>
                                  )}
                                </div>
                              </div>
                              {/* 리뷰 상태 표시 */}
                              <span className={`badge rounded-pill ${
                                review.status === 'POSTED' ? 'bg-success' :
                                  review.status === 'DELETED' ? 'bg-danger' :
                                    review.status === 'FILTERED' ? 'bg-warning' : 'bg-secondary'
                              } text-white px-2 py-1`} style={{fontSize: '0.7rem'}}>
                                <i className={`bi ${
                                  review.status === 'POSTED' ? 'bi-eye-fill' :
                                    review.status === 'DELETED' ? 'bi-trash-fill' :
                                      review.status === 'FILTERED' ? 'bi-eye-slash-fill' : 'bi-question-circle-fill'
                                } me-1`}></i>
                                {review.status === 'POSTED' ? '활성' :
                                  review.status === 'DELETED' ? '삭제됨' :
                                    review.status === 'FILTERED' ? '블라인드' : '알 수 없음'}
                              </span>
                            </div>
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <div className="d-flex align-items-center">
                                {getRatingStars(review.rating)}
                                <span className="ms-2 text-muted small">
                                  {review.rating?.toFixed(1)}점
                                </span>
                              </div>
                              {review.store?.storeType && getStoreTypeBadge(review.store.storeType)}
                            </div>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small">
                              <i className="bi bi-clock me-1"></i>
                              {formatDateTime(review.createdAt)}
                            </span>
                          </div>
                        </div>

                        {review.contents && (
                          <p className="text-dark mb-3" style={{lineHeight: '1.6'}}>
                            {review.contents.length > 100
                              ? `${review.contents.substring(0, 100)}...`
                              : review.contents
                            }
                          </p>
                        )}

                        {/* 리뷰 이미지들 */}
                        {review.images && review.images.length > 0 && (
                          <div className="mb-3">
                            <div className="d-flex gap-2 flex-wrap">
                              {review.images.slice(0, 3).map((image, imgIndex) => (
                                <div key={imgIndex} className="position-relative">
                                  <img
                                    src={image.imageUrl}
                                    alt={`Review ${imgIndex + 1}`}
                                    className="rounded"
                                    style={{
                                      width: '60px',
                                      height: '60px',
                                      objectFit: 'cover',
                                      cursor: 'pointer'
                                    }}
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
                                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-75 rounded text-white"
                                      style={{fontSize: '0.8rem'}}
                                    >
                                      +{review.images.length - 3}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && reviews.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-primary rounded-pill px-4 py-2"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  로딩 중...
                </>
              ) : (
                <>
                  <i className="bi bi-arrow-down-circle me-2"></i>
                  더 많은 리뷰 보기
                </>
              )}
            </button>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && reviews.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{width: '2rem', height: '2rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="text-muted">리뷰를 불러오는 중...</p>
          </div>
        )}
      </div>

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
                      {getRatingStars(selectedReview.rating)}
                      <span className="fw-bold text-warning">{selectedReview.rating?.toFixed(1)}점</span>
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
                    <div className="border rounded p-3 bg-light">
                      <p className="mb-0">{selectedReview.contents || '내용이 없습니다.'}</p>
                    </div>
                  </div>
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold">첨부 이미지 ({selectedReview.images.length}개)</label>
                      <div className="row g-2">
                        {selectedReview.images.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="card">
                              <img
                                src={image.imageUrl}
                                alt={`Review image ${index + 1}`}
                                className="card-img-top"
                                style={{
                                  height: '150px',
                                  objectFit: 'cover',
                                  cursor: 'pointer'
                                }}
                                onClick={() => window.open(image.imageUrl, '_blank')}
                                onError={(e: any) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDEzLjUwNTQgMzAuNjgzOSAxMS4yNzI3IDI4LjQ1MTNDOS4wNDAwNyAyNi4yMTg2IDcuNzI0IDIzLjAzNzYgNy43MjQgMTkuNzIzOUM3LjcyNCAxNi40MTAzIDkuMDQwMDcgMTMuMjI5MyAxMS4yNzI3IDEwLjk5NjdDMTMuNTA1NCA4Ljc2NDA0IDE2LjY4NjMgNy40NDggMjAgNy40NDhDMjMuMzEzNyA3LjQ0OCAyNi40OTQ2IDguNzY0MDQgMjguNzI3MyAxMC45OTY3QzMwLjk1OTkgMTMuMjI5MyAzMi4yNzYgMTYuNDEwMyAzMi4yNzYgMTkuNzIzOUMzMi4yNzYgMjMuMDM3NiAzMC45NTk5IDI2LjIxODYgMjguNzI3MyAyOC40NTEzQzI2LjQ5NDYgMzAuNjgzOSAyMy4zMTM3IDMyIDIwIDMyWk0yMCA5LjI0NzlDMTcuMTY1NSA5LjI0NzkgMTQuNDI3MyAxMC4zNzY0IDEyLjM2ODkgMTIuNDM0OEMxMC4zMTA1IDE0LjQ5MzIgOS4xODE5OSAxNy4yMzE0IDkuMTgxOTkgMjAuMDc1OUM5LjE4MTk5IDIyLjkyMDQgMTAuMzEwNSAyNS42NTg2IDEyLjM2ODkgMjcuNzE3QzE0LjQyNzMgMjkuNzc1MyAxNy4xNjU1IDMwLjkwMzkgMjAgMzAuOTAzOUMyMi44MzQ1IDMwLjkwMzkgMjUuNTcyNyAyOS43NzUzIDI3LjYzMTEgMjcuNzE3QzI5LjY4OTUgMjUuNjU4NiAzMC44MTggMjIuOTIwNCAzMC44MTggMjAuMDc1OUMzMC44MTggMTcuMjMxNCAyOS42ODk1IDE0LjQ5MzIgMjcuNjMxMSAxMi40MzQ4QzI1LjU3MjcgMTAuMzc2NCAyMi44MzQ1IDkuMjQ3OSAyMCA5LjI0NzlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAyNi4yNzZDMjEuOTMzIDI2LjI3NiAyMy40NzYgMjQuNzMzIDIzLjQ3NiAyMi44QzIzLjQ3NiAyMC44NjcgMjEuOTMzIDE5LjMyNCAyMCAxOS4zMjRDMTguMDY3IDE5LjMyNCAxNi41MjQgMjAuODY3IDE2LjUyNCAyMi44QzE2LjUyNCAyNC43MzMgMTguMDY3IDI2LjI3NiAyMCAyNi4yNzZaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
                                  e.target.style.height = '150px';
                                  e.target.style.objectFit = 'contain';
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }}
                              />
                              <div className="card-body p-2">
                                <small className="text-muted">
                                  {image.width} × {image.height}
                                </small>
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
                      <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2">
                        <i className="bi bi-hash me-1"></i>
                        {selectedReview.writer?.userId || '없음'}
                      </span>
                      <span
                        className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-3 py-2">
                        <i className="bi bi-share me-1"></i>
                        {selectedReview.writer?.socialType || '없음'}
                      </span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">가게 타입</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedReview.store?.storeType ? (
                        getStoreTypeBadge(selectedReview.store.storeType)
                      ) : (
                        <span className="text-muted">정보 없음</span>
                      )}
                      {selectedReview.store?.name && (
                        <span className="badge bg-light text-dark border rounded-pill px-3 py-2">
                          <i className="bi bi-shop me-1"></i>
                          {selectedReview.store.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-danger rounded-pill px-4"
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
                      <i className="bi bi-eye-slash me-2"></i>
                      리뷰 블라인드
                    </>
                  )}
                </button>
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowModal(false)}>
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

export default StoreReviewHistory;
