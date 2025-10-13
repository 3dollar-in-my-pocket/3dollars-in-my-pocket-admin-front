import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import reviewApi from '../../api/reviewApi';
import { StoreReview } from '../../types/review';
import { getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon } from '../../types/store';
import UserDetailModal from '../user/UserDetailModal';
import StoreDetailModal from '../store/StoreDetailModal';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState<StoreReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<StoreReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isBlinding, setIsBlinding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [skeletonCount] = useState(3);

  // 초기 데이터 로드
  useEffect(() => {
    fetchReviews(true);
  }, []);

  // Intersection Observer 설정
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          fetchReviews(false);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading]);

  const fetchReviews = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await reviewApi.getAllStoreReviews(reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('리뷰 목록을 불러오는 중 오류가 발생했습니다.');
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
    } catch (error) {
      console.error('리뷰 목록 조회 오류:', error);
      toast.error('리뷰 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchReviews(false);
    }
  }, [hasMore, isLoading, fetchReviews]);

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
        style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', whiteSpace: 'nowrap' }}
      >
        <i className={`bi ${getStoreTypeIcon(storeType as any)} me-1`}></i>
        {getStoreTypeDisplayName(storeType as any)}
      </span>
    );
  };

  const getStatusBadge = (status: string, isMobile = false) => {
    const statusConfig: Record<string, { bg: string; icon: string; text: string }> = {
      POSTED: { bg: 'bg-success', icon: 'bi-eye-fill', text: '활성' },
      FILTERED: { bg: 'bg-warning', icon: 'bi-eye-slash-fill', text: '블라인드' },
      DELETED: { bg: 'bg-danger', icon: 'bi-trash-fill', text: '삭제됨' }
    };

    const config = statusConfig[status] || { bg: 'bg-secondary', icon: 'bi-question-circle-fill', text: '알 수 없음' };

    return (
      <span
        className={`badge rounded-pill ${config.bg} text-white ${isMobile ? 'px-2 py-1' : 'px-3 py-1'}`}
        style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', whiteSpace: 'nowrap' }}
      >
        <i className={`bi ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  // 스켈레톤 로더 컴포넌트
  const SkeletonCard = () => (
    <div className="col-12 col-lg-6">
      <div className="card border-0 shadow-sm h-100" style={{ background: '#f8f9fa' }}>
        <div className="card-body p-2 p-md-3">
          <div className="d-flex gap-2 mb-2">
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{ width: '80px', height: '24px' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded-pill" style={{ width: '100px', height: '24px' }}></div>
          </div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ width: '60%', height: '20px' }}></div>
          <div className="bg-secondary bg-opacity-25 rounded mb-2" style={{ width: '100%', height: '60px' }}></div>
          <div className="d-flex gap-2">
            <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '60px', height: '60px' }}></div>
            <div className="bg-secondary bg-opacity-25 rounded" style={{ width: '60px', height: '60px' }}></div>
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

      if (response.status === 200 || response.status === 204) {
        toast.success('리뷰가 성공적으로 블라인드 처리되었습니다.');
        setShowModal(false);
        // 리뷰 목록 새로고침
        fetchReviews(true);
      } else {
        throw new Error('블라인드 처리 실패');
      }
    } catch (error) {
      console.error('리뷰 블라인드 실패:', error);
      toast.error('리뷰 블라인드 처리 중 오류가 발생했습니다.');
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
        <h2 className="fw-bold mb-0" style={{ fontSize: 'clamp(1.25rem, 5vw, 2rem)' }}>
          <i className="bi bi-chat-square-text text-primary me-2"></i>
          <span className="d-none d-sm-inline">리뷰 관리</span>
          <span className="d-inline d-sm-none">리뷰</span>
        </h2>
        <button
          className="btn btn-outline-primary btn-sm rounded-pill px-2 px-md-3"
          onClick={() => fetchReviews(true)}
          disabled={isLoading}
          style={{ minHeight: '44px', minWidth: '44px' }}
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
            <i className="bi bi-info-circle text-primary mt-1" style={{ fontSize: '1rem' }}></i>
            <div className="flex-grow-1">
              <small className="text-muted d-block" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', lineHeight: '1.5' }}>
                <span className="d-none d-md-inline">전체 가게에 등록된 모든 리뷰를 조회합니다. 스크롤하여 더 많은 리뷰를 자동으로 불러옵니다.</span>
                <span className="d-inline d-md-none">모든 리뷰 조회. 스크롤 시 자동 로드.</span>
              </small>
              {reviews.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                    <i className="bi bi-check-circle me-1"></i>
                    {reviews.length.toLocaleString()}개
                  </span>
                  {hasMore && (
                    <span className="badge bg-info rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
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
        style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}
      >
        {/* 빈 상태 - 개선된 디자인 */}
        {reviews.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div
              className="mx-auto mb-4 position-relative"
              style={{
                width: 'clamp(80px, 20vw, 120px)',
                height: 'clamp(80px, 20vw, 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '50%'
              }}
            >
              <i className="bi bi-chat-square-text text-primary" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}></i>
            </div>
            <h5 className="text-dark mb-2" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>등록된 리뷰가 없습니다</h5>
            <p className="text-muted mb-0" style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>아직 등록된 리뷰가 없습니다.</p>
          </div>
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
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                            <i className="bi bi-person-fill text-primary" style={{ fontSize: '0.75rem' }}></i>
                          </div>
                          <span className="text-primary fw-bold" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                            {review.writer?.name || '익명'}
                          </span>
                          <i className="bi bi-box-arrow-up-right text-primary d-none d-md-inline" style={{ fontSize: '0.7rem' }}></i>
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
                            <div className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                              <i className="bi bi-shop text-success" style={{ fontSize: '0.75rem' }}></i>
                            </div>
                            <span className="text-success fw-bold text-truncate" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)', maxWidth: '120px' }}>
                              {review.store.name}
                            </span>
                            <i className="bi bi-box-arrow-up-right text-success d-none d-md-inline" style={{ fontSize: '0.7rem' }}></i>
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
                        <i className="bi bi-star-fill text-white" style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)' }}></i>
                        <span className="fw-bold text-white" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
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
                      <span className="text-muted ms-auto" style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)' }}>
                        <i className="bi bi-clock me-1"></i>
                        <span className="d-none d-md-inline">{formatDateTime(review.createdAt)}</span>
                        <span className="d-inline d-md-none">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </span>
                      </span>
                    </div>

                    {/* 구분선 */}
                    <hr className="my-2" style={{ opacity: 0.1 }} />

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
                      style={{ minHeight: '44px', fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}
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
            {Array.from({ length: 2 }).map((_, idx) => (
              <SkeletonCard key={`skeleton-${idx}`} />
            ))}
          </div>
        )}

        {/* Intersection Observer 타겟 */}
        {hasMore && reviews.length > 0 && !isLoading && (
          <div ref={loadMoreRef} className="text-center mt-3 mb-3">
            <button
              className="btn btn-outline-primary rounded-pill px-3 px-md-4 py-2"
              onClick={handleLoadMore}
              style={{ minHeight: '44px', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}
            >
              <i className="bi bi-arrow-down-circle me-2"></i>
              <span className="d-none d-sm-inline">더 많은 리뷰 보기</span>
              <span className="d-inline d-sm-none">더보기</span>
            </button>
          </div>
        )}

        {/* 초기 로딩 - 스켈레톤 */}
        {isLoading && reviews.length === 0 && (
          <div className="row g-2 g-md-3">
            {Array.from({ length: skeletonCount }).map((_, idx) => (
              <SkeletonCard key={`skeleton-init-${idx}`} />
            ))}
          </div>
        )}
      </div>

      {/* 리뷰 상세 모달 - 모바일 최적화 */}
      {showModal && selectedReview && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable mx-2 mx-md-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
              <div className="modal-header border-bottom" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' }}>
                <h5 className="modal-title fw-bold" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)' }}>
                  <i className="bi bi-chat-square-text text-primary me-2"></i>
                  리뷰 상세 정보
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                ></button>
              </div>
              <div className="modal-body p-2 p-md-4">
                <div className="row g-2 g-md-3">
                  {/* 평점 카드 - 강조 */}
                  <div className="col-12">
                    <div className="card border-0" style={{
                      background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)',
                      boxShadow: '0 4px 16px rgba(255,152,0,0.4)',
                      border: '2px solid rgba(255,193,7,0.3)'
                    }}>
                      <div className="card-body p-2 p-md-3 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                          {getRatingStars(selectedReview.rating, true)}
                        </div>
                        <h3 className="mb-0 fw-bold text-white">{selectedReview.rating?.toFixed(1)}점</h3>
                      </div>
                    </div>
                  </div>

                  {/* 작성자 & 가게 */}
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>
                      <i className="bi bi-person-fill text-primary me-1"></i>
                      작성자
                    </label>
                    <p className="mb-1" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
                      {selectedReview.writer?.name || '익명 사용자'}
                    </p>
                    <div className="d-flex gap-1 flex-wrap">
                      <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        <i className="bi bi-hash me-1"></i>
                        {selectedReview.writer?.userId || '없음'}
                      </span>
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                        <i className="bi bi-share me-1"></i>
                        {selectedReview.writer?.socialType || '없음'}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>
                      <i className="bi bi-shop text-success me-1"></i>
                      가게 정보
                    </label>
                    <p className="mb-1" style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
                      {selectedReview.store?.name || '정보 없음'}
                    </p>
                    {selectedReview.store?.storeType && (
                      <div>{getStoreTypeBadge(selectedReview.store.storeType)}</div>
                    )}
                  </div>

                  {/* 날짜 정보 */}
                  <div className="col-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>
                      <i className="bi bi-calendar-plus text-muted me-1"></i>
                      작성일
                    </label>
                    <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                      <span className="d-none d-md-block">{formatDateTime(selectedReview.createdAt)}</span>
                      <span className="d-block d-md-none">{new Date(selectedReview.createdAt).toLocaleDateString('ko-KR')}</span>
                    </p>
                  </div>

                  <div className="col-6">
                    <label className="form-label fw-bold mb-1" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.85rem)' }}>
                      <i className="bi bi-calendar-check text-muted me-1"></i>
                      수정일
                    </label>
                    <p className="mb-0 text-muted" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.85rem)' }}>
                      <span className="d-none d-md-block">{formatDateTime(selectedReview.updatedAt)}</span>
                      <span className="d-block d-md-none">{new Date(selectedReview.updatedAt).toLocaleDateString('ko-KR')}</span>
                    </p>
                  </div>

                  {/* 리뷰 내용 */}
                  <div className="col-12">
                    <label className="form-label fw-bold mb-2" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>
                      <i className="bi bi-chat-square-quote text-primary me-1"></i>
                      리뷰 내용
                    </label>
                    <div className="border rounded p-2 p-md-3" style={{
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                      borderColor: '#e9ecef !important'
                    }}>
                      <p className="mb-0" style={{
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6',
                        fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
                      }}>
                        {selectedReview.contents || '내용이 없습니다.'}
                      </p>
                    </div>
                  </div>

                  {/* 이미지 갤러리 */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold mb-2" style={{ fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}>
                        <i className="bi bi-images text-info me-1"></i>
                        첨부 이미지 ({selectedReview.images.length}개)
                      </label>
                      <div className="row g-2">
                        {selectedReview.images.map((image, index) => (
                          <div key={index} className="col-6 col-md-4 col-lg-3">
                            <div className="card border-0 shadow-sm h-100" style={{ overflow: 'hidden' }}>
                              <img
                                src={image.imageUrl}
                                alt={`Review image ${index + 1}`}
                                className="card-img-top"
                                style={{
                                  height: 'clamp(150px, 35vw, 200px)',
                                  objectFit: 'cover',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onClick={() => window.open(image.imageUrl, '_blank')}
                                onMouseEnter={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e: any) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                                onError={(e: any) => {
                                  e.target.src =
                                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDEzLjUwNTQgMzAuNjgzOSAxMS4yNzI3IDI4LjQ1MTNDOS4wNDAwNyAyNi4yMTg2IDcuNzI0IDIzLjAzNzYgNy43MjQgMTkuNzIzOUM3LjcyNCAxNi40MTAzIDkuMDQwMDcgMTMuMjI5MyAxMS4yNzI3IDEwLjk5NjdDMTMuNTA1NCA4Ljc2NDA0IDE2LjY4NjMgNy40NDggMjAgNy40NDhDMjMuMzEzNyA3LjQ0OCAyNi40OTQ2IDguNzY0MDQgMjguNzI3MyAxMC45OTY3QzMwLjk1OTkgMTMuMjI5MyAzMi4yNzYgMTYuNDEwMyAzMi4yNzYgMTkuNzIzOUMzMi4yNzYgMjMuMDM3NiAzMC45NTk5IDI2LjIxODYgMjguNzI3MyAyOC40NTEzQzI2LjQ5NDYgMzAuNjgzOSAyMy4zMTM3IDMyIDIwIDMyWk0yMCA5LjI0NzlDMTcuMTY1NSA5LjI0NzkgMTQuNDI3MyAxMC4zNzY0IDEyLjM2ODkgMTIuNDM0OEMxMC4zMTA1IDE0LjQ5MzIgOS4xODE5OSAxNy4yMzE0IDkuMTgxOTkgMjAuMDc1OUM5LjE4MTk5IDIyLjkyMDQgMTAuMzEwNSAyNS42NTg2IDEyLjM2ODkgMjcuNzE3QzE0LjQyNzMgMjkuNzc1MyAxNy4xNjU1IDMwLjkwMzkgMjAgMzAuOTAzOUMyMi44MzQ1IDMwLjkwMzkgMjUuNTcyNyAyOS43NzUzIDI3LjYzMTEgMjcuNzE3QzI5LjY4OTUgMjUuNjU4NiAzMC44MTggMjIuOTIwNCAzMC44MTggMjAuMDc1OUMzMC44MTggMTcuMjMxNCAyOS42ODk1IDE0LjQ5MzIgMjcuNjMxMSAxMi40MzQ4QzI1LjU3MjcgMTAuMzc2NCAyMi44MzQ1IDkuMjQ3OSAyMCA5LjI0NzlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAyNi4yNzZDMjEuOTMzIDI2LjI3NiAyMy40NzYgMjQuNzMzIDIzLjQ3NiAyMi44QzIzLjQ3NiAyMC44NjcgMjEuOTMzIDE5LjMyNCAyMCAxOS4zMjRDMTguMDY3IDE5LjMyNCAxNi41MjQgMjAuODY3IDE2LjUyNCAyMi44QzE2LjUyNCAyNC43MzMgMTguMDY3IDI2LjI3NiAyMCAyNi4yNzZaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
                                  e.target.style.height = 'clamp(150px, 35vw, 200px)';
                                  e.target.style.objectFit = 'contain';
                                  e.target.style.backgroundColor = '#f8f9fa';
                                }}
                              />
                              <div className="card-body p-2 d-none d-md-block">
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>
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
              <div className="modal-footer border-top d-flex flex-column flex-md-row justify-content-between gap-2 p-2 p-md-3">
                <button
                  className="btn btn-danger rounded-pill px-3 px-md-4 w-100 w-md-auto order-2 order-md-1"
                  style={{ minHeight: '44px', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}
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
                  className="btn btn-secondary rounded-pill px-3 px-md-4 w-100 w-md-auto order-1 order-md-2"
                  style={{ minHeight: '44px', fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)' }}
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
      <UserDetailModal show={!!selectedUser} onHide={() => setSelectedUser(null)} user={selectedUser} onStoreClick={() => {}} />

      {/* 가게 상세 모달 */}
      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={handleAuthorClick}
        onStoreDeleted={() => {}}
      />
    </div>
  );
};

export default ReviewManagement;
