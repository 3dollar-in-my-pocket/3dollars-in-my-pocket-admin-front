import {useEffect, useState, useCallback, useRef} from 'react';
import {toast} from 'react-toastify';
import reviewApi from '../../api/reviewApi';
import {StoreReview} from '../../types/review';
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from '../../types/store';
import UserDetailModal from '../user/UserDetailModal';
import StoreDetailModal from '../store/StoreDetailModal';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../../components/common/EmptyState';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedReview, setSelectedReview] = useState<StoreReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isBlinding, setIsBlinding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [skeletonCount] = useState(3);

  // cursor와 isLoading을 ref로 관리하여 useCallback 의존성 문제 해결
  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchReviews = useCallback(async (reset = false) => {
    // 중복 호출 방지
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await reviewApi.getAllStoreReviews(reset ? null : cursorRef.current, 20);
      if (!response?.ok) {
        return;
      }

      const {contents = [], cursor: newCursor} = response.data || { contents: [], cursor: { hasMore: false, nextCursor: null } };

      if (reset) {
        setReviews(contents);
        cursorRef.current = null; // reset 시 cursor 초기화
      } else {
        setReviews(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      cursorRef.current = newCursor.nextCursor || null;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchReviews(true);
  }, [fetchReviews]);

  // Infinite Scroll 훅 사용
  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchReviews(false),
    threshold: 0.1
  });

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating: number, isWhite = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const starClass = isWhite ? 'text-white' : 'text-warning';
    const emptyClass = isWhite ? 'text-white opacity-50' : 'text-muted';

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className={`bi bi-star-fill ${starClass}`}></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half" className={`bi bi-star-half ${starClass}`}></i>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className={`bi bi-star ${emptyClass}`}></i>);
    }

    return stars;
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

  const getStatusBadge = (status: string, isMobile = false) => {
    const statusConfig: Record<string, { bg: string; icon: string; text: string }> = {
      POSTED: {bg: 'bg-success', icon: 'bi-eye-fill', text: '활성'},
      FILTERED: {bg: 'bg-warning', icon: 'bi-eye-slash-fill', text: '블라인드'},
      DELETED: {bg: 'bg-danger', icon: 'bi-trash-fill', text: '삭제됨'}
    };

    const config = statusConfig[status] || {bg: 'bg-secondary', icon: 'bi-question-circle-fill', text: '알 수 없음'};

    return (
      <span
        className={`badge rounded-pill ${config.bg} text-white ${isMobile ? 'px-2 py-1' : 'px-3 py-1'}`}
        style={{fontSize: isMobile ? '0.65rem' : '0.75rem', whiteSpace: 'nowrap'}}
      >
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  // 스켈레톤 로더 컴포넌트
  const SkeletonCard = () => (
    <div className="col-12 col-lg-6">
      <div className="card border-0 shadow-sm h-100" style={{background: '#f8f9fa'}}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex gap-2 mb-2">
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{width: '80px', height: '24px'}}></div>
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{width: '100px', height: '24px'}}></div>
          </div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{width: '60%', height: '20px'}}></div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{width: '100%', height: '60px'}}></div>
          <div className="d-flex gap-2">
            <div className="bg-secondary bg-opacity-25 rounded" style={{width: '60px', height: '60px'}}></div>
            <div className="bg-secondary bg-opacity-25 rounded" style={{width: '60px', height: '60px'}}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const handleReviewClick = (review: StoreReview) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleBlindReview = async () => {
    if (!selectedReview) return;

    const confirmed = window.confirm(
      `정말로 이 리뷰를 블라인드 처리하시겠습니까?\n\n작성자: ${selectedReview.writer?.name || '익명 사용자'}\n내용: ${selectedReview.contents?.substring(0, 50)}...\n\n이 작업은 되돌릴 수 없습니다.`
    );

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

  const handleAuthorClick = (writer: any) => {
    if (writer?.userId) {
      setSelectedUser({
        userId: writer.userId,
        nickname: writer.name || `ID: ${writer.userId}`
      });
    }
  };

  const handleStoreClick = (store: any) => {
    if (store?.storeId) {
      setSelectedStore(store);
    }
  };

  return (
    <div className="container-fluid px-2 px-md-4 py-2 py-md-4">
      {/* 헤더 - 모바일 최적화 */}
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-0" style={{fontSize: 'clamp(1.25rem, 5vw, 2rem)'}}>
          <i className="bi bi-chat-square-text text-primary me-2"></i>
          <span className="d-none d-sm-inline">리뷰 관리</span>
          <span className="d-inline d-sm-none">리뷰</span>
        </h2>
        <button
          className="btn btn-outline-primary btn-sm rounded-pill px-2 px-md-3"
          onClick={() => fetchReviews(true)}
          disabled={isLoading}
          style={{minHeight: '44px', minWidth: '44px'}}
        >
          <i className="bi bi-arrow-clockwise me-0 me-md-1"></i>
          <span className="d-none d-md-inline">새로고침</span>
        </button>
      </div>

      {/* 정보 카드 - 모바일 최적화 */}
      <div className="card border-0 shadow-sm mb-3" style={{
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        borderLeft: '4px solid #667eea'
      }}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex align-items-start gap-2">
            <i className="bi bi-info-circle text-primary mt-1" style={{fontSize: '1rem'}}></i>
            <div className="flex-grow-1">
              <small className="text-muted d-block"
                     style={{fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', lineHeight: '1.5'}}>
                <span className="d-none d-md-inline">전체 가게에 등록된 모든 리뷰를 조회합니다. 스크롤하여 더 많은 리뷰를 자동으로 불러옵니다.</span>
                <span className="d-inline d-md-none">모든 리뷰 조회. 스크롤 시 자동 로드.</span>
              </small>
              {reviews.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  <span className="badge bg-primary rounded-pill px-2 py-1" style={{fontSize: '0.7rem'}}>
                    <i className="bi bi-check-circle me-1"></i>
                    {reviews.length.toLocaleString()}개
                  </span>
                  {hasMore && (
                    <span className="badge bg-info rounded-pill px-2 py-1" style={{fontSize: '0.7rem'}}>
                      <i className="bi bi-arrow-down-circle me-1"></i>
                      <span className="d-none d-sm-inline">더 많은 리뷰 있음</span>
                      <span className="d-inline d-sm-none">더보기</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="review-container"
        style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto'}}
      >
        {/* 빈 상태 */}
        {reviews.length === 0 && !isLoading ? (
          <EmptyState
            icon="bi-chat-square-text"
            title="등록된 리뷰가 없습니다"
            description="아직 등록된 리뷰가 없습니다."
          />
        ) : (
          <div className="row g-2 g-md-3">
            {reviews.map((review) => (
              <div key={review.reviewId} className="col-12 col-lg-6">
                <div
                  className="card border-0 shadow-sm h-100 review-card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderLeft: '3px solid transparent'
                  }}
                  onClick={() => handleReviewClick(review)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderLeftColor = '#667eea';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderLeftColor = 'transparent';
                  }}
                >
                  <div className="card-body p-2 p-md-3">
                    {/* 상단: 사용자 정보 + 평점 */}
                    <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
                      <div className="d-flex flex-wrap align-items-center gap-1 gap-md-2 flex-grow-1">
                        {/* 작성자 정보 - 모바일 최적화 */}
                        <div
                          className="d-flex align-items-center gap-1 gap-md-2 clickable-author"
                          style={{
                            cursor: 'pointer',
                            padding: '3px 6px',
                            borderRadius: '8px',
                            transition: 'all 0.2s ease',
                            backgroundColor: 'transparent',
                            minHeight: '44px'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (review.writer) {
                              handleAuthorClick(review.writer);
                            }
                          }}
                          onMouseEnter={(e: any) => {
                            e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                            e.currentTarget.style.transform = 'scale(1.02)';
                          }}
                          onMouseLeave={(e: any) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          <span className="text-primary fw-bold" style={{fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'}}>
                            {review.writer?.name || '익명'}
                          </span>
                        </div>

                        {/* 가게 정보 - 모바일 최적화 */}
                        {review.store && (
                          <div
                            className="d-flex align-items-center gap-1 gap-md-2 clickable-author"
                            style={{
                              cursor: 'pointer',
                              padding: '3px 6px',
                              borderRadius: '8px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent',
                              minHeight: '44px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStoreClick(review.store);
                            }}
                            onMouseEnter={(e: any) => {
                              e.currentTarget.style.backgroundColor = 'rgba(25, 135, 84, 0.1)';
                              e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e: any) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <span className="text-success fw-bold text-truncate"
                                  style={{fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', maxWidth: '120px'}}>
                              {review.store.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 평점 - 오른쪽 상단으로 이동 */}
                      <div className="d-flex align-items-center gap-1 flex-shrink-0" style={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        boxShadow: '0 2px 10px rgba(255,152,0,0.3)',
                        border: '1px solid rgba(255,193,7,0.3)'
                      }}>
                        <i className="bi bi-star-fill text-white" style={{fontSize: 'clamp(0.7rem, 2vw, 0.85rem)'}}></i>
                        <span className="fw-bold text-white" style={{fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'}}>
                          {review.rating?.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* 배지 행 - 모바일 최적화 */}
                    <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
                      {getStatusBadge(review.status, true)}
                      {review.store?.storeType && (
                        <span className="d-none d-sm-inline">{getStoreTypeBadge(review.store.storeType, true)}</span>
                      )}
                      {/* 날짜 - 모바일에서는 더 작게 */}
                      <span className="text-muted ms-auto" style={{fontSize: 'clamp(0.65rem, 2vw, 0.75rem)'}}>
                        <i className="bi bi-clock me-1"></i>
                        <span className="d-none d-md-inline">{formatDateTime(review.createdAt)}</span>
                        <span className="d-inline d-md-none">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'})}
                        </span>
                      </span>
                    </div>

                    {/* 구분선 */}
                    <hr className="my-2" style={{opacity: 0.1}}/>

                    {/* 리뷰 내용 - 모바일 최적화 */}
                    {review.contents && (
                      <p className="text-dark mb-2" style={{
                        lineHeight: '1.5',
                        fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: window.innerWidth < 768 ? 2 : 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {review.contents}
                      </p>
                    )}

                    {/* 리뷰 이미지들 - 모바일에서 2x2 그리드 */}
                    {review.images && review.images.length > 0 && (
                      <div className="mb-2">
                        <div className="d-flex gap-2 flex-wrap">
                          {review.images.slice(0, 4).map((image, imgIndex) => (
                            <div key={imgIndex} className="position-relative">
                              <img
                                src={image.imageUrl}
                                alt={`Review ${imgIndex + 1}`}
                                className="rounded"
                                style={{
                                  width: 'clamp(70px, 20vw, 100px)',
                                  height: 'clamp(70px, 20vw, 100px)',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewClick(review);
                                }}
                                onMouseEnter={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onError={(e: any) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {imgIndex === 3 && review.images.length > 4 && (
                                <div
                                  className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded"
                                  style={{
                                    background: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(2px)',
                                    fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
                                    fontWeight: 'bold',
                                    color: 'white'
                                  }}
                                >
                                  +{review.images.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 하단: 상세보기 버튼 - 모바일 최적화 */}
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill w-100 d-flex align-items-center justify-content-center gap-2"
                      style={{minHeight: '44px', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)'}}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReviewClick(review);
                      }}
                    >
                      <i className="bi bi-eye"></i>
                      <span>상세보기</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 스켈레톤 로더 - 페이지네이션 로딩 */}
        {isLoading && reviews.length > 0 && (
          <div className="row g-2 g-md-3 mt-2">
            {Array.from({length: 2}).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`}/>
            ))}
          </div>
        )}

        {/* Intersection Observer 타겟 - 항상 렌더링 */}
        <div
          ref={loadMoreRef}
          className="text-center mt-3 mb-3"
          style={{
            display: hasMore && reviews.length > 0 ? 'block' : 'none',
            minHeight: '50px'
          }}
        >
          {isLoading && (
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>

        {/* 초기 로딩 - 스켈레톤 */}
        {isLoading && reviews.length === 0 && (
          <div className="row g-2 g-md-3">
            {Array.from({length: skeletonCount}).map((_, idx) => (
              <SkeletonCard key={`skeleton-init-${idx}`}/>
            ))}
          </div>
        )}
      </div>

      {/* 리뷰 상세 모달 - UX 개선 */}
      {showModal && selectedReview && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.6)'}}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable mx-2 mx-md-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{borderRadius: '16px', border: 'none'}}>
              {/* 헤더 - 평점 포함 */}
              <div className="modal-header border-bottom" style={{
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                padding: '1rem 1.5rem'
              }}>
                <div className="d-flex align-items-center gap-3 flex-grow-1">
                  <h5 className="modal-title fw-bold mb-0" style={{fontSize: 'clamp(1rem, 4vw, 1.25rem)'}}>
                    <i className="bi bi-chat-square-text text-primary me-2"></i>
                    리뷰 상세 정보
                  </h5>
                  {/* 평점 배지 - 헤더에 통합 */}
                  <div className="d-flex align-items-center gap-1 ms-auto" style={{
                    background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(255,152,0,0.3)'
                  }}>
                    <i className="bi bi-star-fill text-white" style={{fontSize: '0.85rem'}}></i>
                    <span className="fw-bold text-white" style={{fontSize: '0.95rem'}}>
                      {selectedReview.rating?.toFixed(1)}
                    </span>
                  </div>
                  {/* 상태 배지 */}
                  {getStatusBadge(selectedReview.status)}
                </div>
                <button
                  type="button"
                  className="btn-close ms-3"
                  onClick={() => setShowModal(false)}
                  style={{minWidth: '44px', minHeight: '44px'}}
                ></button>
              </div>

              <div className="modal-body p-3 p-md-4">
                <div className="row g-3">
                  {/* 작성자 카드 - 클릭 가능 */}
                  <div className="col-12 col-md-6">
                    <div
                      className="card border-0 h-100"
                      style={{
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                        cursor: selectedReview.writer?.userId ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      onClick={() => selectedReview.writer && handleAuthorClick(selectedReview.writer)}
                      onMouseEnter={(e: any) => {
                        if (selectedReview.writer?.userId) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(13, 110, 253, 0.2)';
                        }
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="mb-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="text-muted small">작성자</span>
                          </div>
                          <h6 className="fw-bold text-primary mb-0" style={{fontSize: '1.1rem'}}>
                            {selectedReview.writer?.name || '익명 사용자'}
                          </h6>
                        </div>
                        <div className="d-flex gap-1 flex-wrap">
                          <span
                            className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                            style={{fontSize: '0.7rem'}}>
                            <i className="bi bi-hash me-1"></i>
                            {selectedReview.writer?.userId || '없음'}
                          </span>
                          <span
                            className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                            style={{fontSize: '0.7rem'}}>
                            <i className="bi bi-share me-1"></i>
                            {selectedReview.writer?.socialType || '없음'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 가게 카드 - 클릭 가능 */}
                  <div className="col-12 col-md-6">
                    <div
                      className="card border-0 h-100"
                      style={{
                        background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
                        cursor: selectedReview.store?.storeId ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                      onClick={() => selectedReview.store && handleStoreClick(selectedReview.store)}
                      onMouseEnter={(e: any) => {
                        if (selectedReview.store?.storeId) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 135, 84, 0.2)';
                        }
                      }}
                      onMouseLeave={(e: any) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="mb-2">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="text-muted small">가게</span>
                          </div>
                          <h6 className="fw-bold text-success mb-0" style={{fontSize: '1.1rem'}}>
                            {selectedReview.store?.name || '정보 없음'}
                          </h6>
                        </div>
                        <div className="d-flex gap-1 flex-wrap">
                          {selectedReview.store?.storeType && getStoreTypeBadge(selectedReview.store.storeType)}
                          {selectedReview.store?.storeId && (
                            <span
                              className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2 py-1"
                              style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-hash me-1"></i>
                              {selectedReview.store.storeId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 날짜 정보 - 통합 */}
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3">
                      <div className="d-flex align-items-center gap-2 flex-grow-1">
                        <i className="bi bi-clock text-muted"></i>
                        <span className="text-muted small">작성일:</span>
                        <span className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                          {formatDateTime(selectedReview.createdAt)}
                        </span>
                      </div>
                      <div className="d-none d-md-flex align-items-center gap-2">
                        <i className="bi bi-clock-history text-muted"></i>
                        <span className="text-muted small">수정일:</span>
                        <span className="fw-semibold text-dark" style={{fontSize: '0.9rem'}}>
                          {formatDateTime(selectedReview.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 구분선 */}
                  <div className="col-12">
                    <hr className="my-2"/>
                  </div>

                  {/* 리뷰 내용 */}
                  <div className="col-12">
                    <div className="mb-2 d-flex align-items-center gap-2">
                      <i className="bi bi-chat-square-quote text-primary" style={{fontSize: '1.1rem'}}></i>
                      <h6 className="fw-bold mb-0">리뷰 내용</h6>
                    </div>
                    <div className="p-3 rounded-3" style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      border: '1px solid #e9ecef'
                    }}>
                      <p className="mb-0" style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.7',
                        fontSize: '1rem',
                        color: '#333'
                      }}>
                        {selectedReview.contents || '내용이 없습니다.'}
                      </p>
                    </div>
                  </div>

                  {/* 이미지 갤러리 */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="col-12">
                      <div className="mb-3 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-images text-info" style={{fontSize: '1.1rem'}}></i>
                          <h6 className="fw-bold mb-0">첨부 이미지</h6>
                        </div>
                        <span
                          className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-1">
                          {selectedReview.images.length}개
                        </span>
                      </div>
                      <div className="row g-2">
                        {selectedReview.images.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="position-relative card border-0 shadow-sm h-100" style={{
                              overflow: 'hidden',
                              borderRadius: '12px'
                            }}>
                              <img
                                src={image.imageUrl}
                                alt={`Review image ${index + 1}`}
                                className="card-img-top"
                                style={{
                                  height: '180px',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  transition: 'transform 0.3s ease'
                                }}
                                onClick={() => window.open(image.imageUrl, '_blank')}
                                onMouseEnter={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1.08)';
                                }}
                                onMouseLeave={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onError={(e: any) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDEzLjUwNTQgMzAuNjgzOSAxMS4yNzI3IDI4LjQ1MTNDOS4wNDAwNyAyNi4yMTg2IDcuNzI0IDIzLjAzNzYgNy43MjQgMTkuNzIzOUM3LjcyNCAxNi40MTAzIDkuMDQwMDcgMTMuMjI5MyAxMS4yNzI3IDEwLjk5NjdDMTMuNTA1NCA4Ljc2NDA0IDE2LjY4NjMgNy40NDggMjAgNy40NDhDMjMuMzEzNyA3LjQ0OCAyNi40OTQ2IDguNzY0MDQgMjguNzI3MyAxMC45OTY3QzMwLjk1OTkgMTMuMjI5MyAzMi4yNzYgMTYuNDEwMyAzMi4yNzYgMTkuNzIzOUMzMi4yNzYgMjMuMDM3NiAzMC45NTk5IDI2LjIxODYgMjguNzI3MyAyOC40NTEzQzI2LjQ5NDYgMzAuNjgzOSAyMy4zMTM3IDMyIDIwIDMyWk0yMCA5LjI0NzlDMTcuMTY1NSA5LjI0NzkgMTQuNDI3MyAxMC4zNzY0IDEyLjM2ODkgMTIuNDM0OEMxMC4zMTA1IDE0LjQ5MzIgOS4xODE5OSAxNy4yMzE0IDkuMTgxOTkgMjAuMDc1OUM5LjE4MTk5IDIyLjkyMDQgMTAuMzEwNSAyNS42NTg2IDEyLjM2ODkgMjcuNzE3QzE0LjQyNzMgMjkuNzc1MyAxNy4xNjU1IDMwLjkwMzkgMjAgMzAuOTAzOUMyMi44MzQ1IDMwLjkwMzkgMjUuNTcyNyAyOS43NzUzIDI3LjYzMTEgMjcuNzE3QzI5LjY4OTUgMjUuNjU4NiAzMC44MTggMjIuOTIwNCAzMC44MTggMjAuMDc1OUMzMC44MTggMTcuMjMxNCAyOS42ODk1IDE0LjQ5MzIgMjcuNjMxMSAxMi40MzQ4QzI1LjU3MjcgMTAuMzc2NCAyMi44MzQ1IDkuMjQ3OSAyMCA5LjI0NzlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAyNi4yNzZDMjEuOTMzIDI2LjI3NiAyMy40NzYgMjQuNzMzIDIzLjQ3NiAyMi44QzIzLjQ3NiAyMC44NjcgMjEuOTMzIDE5LjMyNCAyMCAxOS4zMjRDMTguMDY3IDE5LjMyNCAxNi41MjQgMjAuODY3IDE2LjUyNCAyMi44QzE2LjUyNCAyNC43MzMgMTguMDY3IDI2LjI3NiAyMCAyNi4yNzZaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
                                  e.target.style.objectFit = 'contain';
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }}
                              />
                              {/* 이미지 확대 힌트 */}
                              <div className="position-absolute top-0 end-0 m-2">
                                <div className="bg-dark bg-opacity-75 rounded-circle p-1" style={{
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <i className="bi bi-arrows-fullscreen text-white" style={{fontSize: '0.7rem'}}></i>
                                </div>
                              </div>
                              <div className="card-body p-2 d-none d-md-block bg-light">
                                <small className="text-muted d-block" style={{fontSize: '0.7rem'}}>
                                  <i className="bi bi-aspect-ratio me-1"></i>
                                  {image.width} × {image.height}
                                </small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 푸터 */}
              <div className="modal-footer border-top d-flex flex-column flex-md-row justify-content-between gap-2 p-3">
                <button
                  className="btn btn-danger rounded-pill px-4 w-100 w-md-auto order-2 order-md-1"
                  style={{minHeight: '44px'}}
                  onClick={handleBlindReview}
                  disabled={isBlinding || selectedReview.status === 'FILTERED'}
                >
                  {isBlinding ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-eye-slash me-2"></i>
                      {selectedReview.status === 'FILTERED' ? '이미 블라인드됨' : '리뷰 블라인드'}
                    </>
                  )}
                </button>
                <button
                  className="btn btn-secondary rounded-pill px-4 w-100 w-md-auto order-1 order-md-2"
                  style={{minHeight: '44px'}}
                  onClick={() => setShowModal(false)}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 유저 상세 모달 */}
      <UserDetailModal show={!!selectedUser} onHide={() => setSelectedUser(null)} user={selectedUser}
                       onStoreClick={() => {
                       }}/>

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={handleAuthorClick}
        onStoreDeleted={() => {
        }}
      />
    </div>
  );
};

export default ReviewManagement;
