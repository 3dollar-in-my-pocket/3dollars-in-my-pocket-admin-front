import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import reviewApi from '@/api/reviewApi';
import {Review} from '@/types/review';

import UserDetailModal from '@/pages/user/UserDetailModal';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DetailField from '@/components/common/DetailField';
import BulkSelectionToolbar from '@/components/common/BulkSelectionToolbar';
import useBulkSelection from '@/hooks/useBulkSelection';

import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';

/** 카드에 한 번에 노출하는 카테고리 / 이미지 개수 */
const VISIBLE_CATEGORIES = 2;
const VISIBLE_IMAGES = 4;

/** 블라인드 일괄 처리 API가 한 번에 받을 수 있는 최대 리뷰 수 */
const MAX_BULK_SELECTION = 50;

const STATUS_CONFIG: Record<string, { className: string; icon: string; text: string }> = {
  POSTED: {className: 'bg-success-subtle text-success-emphasis', icon: 'bi-eye-fill', text: '활성'},
  FILTERED: {className: 'bg-warning-subtle text-warning-emphasis', icon: 'bi-eye-slash-fill', text: '블라인드'},
  DELETED: {className: 'bg-danger-subtle text-danger-emphasis', icon: 'bi-trash-fill', text: '삭제됨'}
};

const ReviewManagement = () => {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isBlinding, setIsBlinding] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [skeletonCount] = useState(4);

  const fetchReviews = useCallback(
    (cursor: string | null) => reviewApi.getAllStoreReviews(cursor, 20),
    []
  );

  const {
    items: reviews,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<Review>({
    fetcher: fetchReviews,
    errorMessage: '리뷰를 불러오는데 실패했습니다.'
  });

  // Infinite Scroll 훅 사용
  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1
  });

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status]
      || {className: 'bg-secondary-subtle text-secondary-emphasis', icon: 'bi-question-circle-fill', text: '알 수 없음'};

    return (
      <span className={`badge ${config.className}`}>
        <i className={`bi ${config.icon} me-1`}/>
        {config.text}
      </span>
    );
  };

  // 스켈레톤 로더 컴포넌트
  const SkeletonCard = () => (
    <div className="col-12 col-lg-6">
      <div className="item-card h-100">
        <div className="item-card__body">
          <div className="d-flex gap-2 mb-2">
            <div className="skeleton-line" style={{width: '80px'}}/>
            <div className="skeleton-line" style={{width: '100px'}}/>
          </div>
          <div className="skeleton-line mb-2" style={{width: '60%'}}/>
          <div className="skeleton-line mb-2" style={{width: '100%', height: '48px'}}/>
          <div className="d-flex gap-2">
            <div className="skeleton-line" style={{width: '64px', height: '64px'}}/>
            <div className="skeleton-line" style={{width: '64px', height: '64px'}}/>
          </div>
        </div>
      </div>
    </div>
  );

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
        setSelectedReview(null);
        // 리뷰 목록 새로고침
        refresh();
      }
    } finally {
      setIsBlinding(false);
    }
  };

  const selection = useBulkSelection<Review, number>({
    items: reviews,
    getKey: review => review.reviewId,
    max: MAX_BULK_SELECTION,
    // 삭제된 리뷰는 블라인드 대상이 아닙니다.
    isSelectable: review => review.status !== 'DELETED'
  });
  const selectedIds = selection.selectedList;

  const handleBulkBlind = async () => {
    if (!window.confirm(`선택한 리뷰 ${selectedIds.length}개를 블라인드 처리하시겠습니까?`)) return;
    setIsBlinding(true);
    try {
      const response = await reviewApi.blindStoreReviewsBulk(selectedIds);
      if (response.ok) {
        toast.success('선택한 리뷰 블라인드 요청이 완료되었습니다.');
        selection.clear();
        refresh();
      }
    } finally { setIsBlinding(false); }
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
    <div>
      <PageHeader
        description="전체 가게에 등록된 리뷰를 조회하고 블라인드 처리합니다. 스크롤하면 다음 리뷰를 자동으로 불러옵니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <SectionCard
        title="리뷰 목록"
        icon="bi-chat-square-text-fill"
        aside={reviews.length > 0 && (
          <span className="page-count">{reviews.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        {selectedIds.length > 0 && <div className="alert alert-primary bulk-action-bar py-2">
          <strong>{selectedIds.length}개 선택됨</strong><div className="bulk-action-bar__actions">
          <button className="btn btn-sm btn-outline-danger" onClick={handleBulkBlind} disabled={isBlinding}>{isBlinding ? '처리 중...' : '일괄 블라인드'}</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={selection.clear}>선택 해제</button></div>
        </div>}
        {reviews.length > 0 && (
          <BulkSelectionToolbar
            id="review-bulk-select"
            unit="개"
            selectedCount={selection.selectedCount}
            selectableCount={selection.selectableCount}
            isAllSelected={selection.isAllSelected}
            isPartiallySelected={selection.isPartiallySelected}
            onToggleAll={selection.toggleAll}
            onClear={selection.clear}
            onSelectRange={selection.selectRange}
            max={MAX_BULK_SELECTION}
          />
        )}
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
          {error ? (
            <ErrorState message={error} onRetry={refresh}/>
          ) : reviews.length === 0 && !isLoading ? (
            <EmptyState
              icon="bi-chat-square-text"
              title="등록된 리뷰가 없습니다"
              description="아직 등록된 리뷰가 없습니다."
            />
          ) : (
            <div className="row g-3">
              {reviews.map((review, index) => (
                <div key={review.reviewId} className="col-12 col-lg-6">
                  <div
                    className={`item-card item-card--clickable h-100 ${selection.isSelected(review.reviewId) ? 'border border-primary border-2' : ''}`}
                    onClick={() => setSelectedReview(review)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedReview(review);
                      }
                    }}
                  >
                    <div className="item-card__body">
                      <button type="button"
                              className={`btn btn-sm float-end ms-2 review-select-button ${selection.isSelected(review.reviewId) ? 'btn-primary' : 'btn-outline-secondary'}`}
                              disabled={review.status === 'DELETED'} aria-pressed={selection.isSelected(review.reviewId)}
                              aria-label={`리뷰 ${review.reviewId} ${selection.isSelected(review.reviewId) ? '선택 해제' : '선택'}`}
                              onClick={e => { e.stopPropagation(); selection.toggle(review.reviewId, index, e); }}>
                        <i className={`bi ${selection.isSelected(review.reviewId) ? 'bi-check-square-fill' : 'bi-square'} me-1`}/>
                        {review.status === 'DELETED' ? '선택 불가' : selection.isSelected(review.reviewId) ? '선택됨' : '선택'}
                      </button>
                      {/* 가게 + 평점 */}
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div className="min-w-0">
                          {review.store ? (
                            <button
                              type="button"
                              className="btn btn-link p-0 text-start item-card__name text-decoration-none"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStoreClick(review.store);
                              }}
                            >
                              <i className="bi bi-shop me-1"/>
                              {review.store.name || '가게 이름 없음'}
                              <i className="bi bi-box-arrow-up-right ms-1 small"/>
                            </button>
                          ) : (
                            <h3 className="item-card__name mb-0">가게 정보 없음</h3>
                          )}
                          {review.store?.address?.fullAddress && (
                            <p className="item-card__desc mb-0">
                              <i className="bi bi-geo-alt me-1"/>
                              {review.store.address.fullAddress}
                            </p>
                          )}
                        </div>
                        <span className="rating-badge flex-shrink-0">
                          <i className="bi bi-star-fill"/>
                          {review.rating?.toFixed(1)}
                        </span>
                      </div>

                      {/* 배지 행 */}
                      <div className="form-chips">
                        {getStatusBadge(review.status)}
                        {review.store?.storeType && <StoreTypeBadge storeType={review.store.storeType} size="sm"/>}
                        {review.store?.categories?.slice(0, VISIBLE_CATEGORIES).map((category: any, idx: number) => (
                          <span key={idx} className="form-chip">{category.name}</span>
                        ))}
                        {review.store?.categories?.length > VISIBLE_CATEGORIES && (
                          <span className="form-chip">
                            +{review.store.categories.length - VISIBLE_CATEGORIES}
                          </span>
                        )}
                      </div>

                      {/* 리뷰 내용 */}
                      {review.contents && (
                        <p className="item-card__desc mt-3 mb-0 text-clamp-3">{review.contents}</p>
                      )}

                      {/* 리뷰 이미지 */}
                      {review.images && review.images.length > 0 && (
                        <div className="d-flex gap-2 flex-wrap mt-3">
                          {review.images.slice(0, VISIBLE_IMAGES).map((image, imgIndex) => (
                            <div key={imgIndex} className="review-thumb">
                              <img
                                src={image.imageUrl}
                                alt={`리뷰 이미지 ${imgIndex + 1}`}
                                onError={(e: any) => {
                                  e.target.style.visibility = 'hidden';
                                }}
                              />
                              {imgIndex === VISIBLE_IMAGES - 1 && review.images.length > VISIBLE_IMAGES && (
                                <span className="review-thumb__more">
                                  +{review.images.length - VISIBLE_IMAGES}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 작성자 + 작성일 */}
                      <div className="d-flex justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                        <div className="small text-secondary">
                          작성자:{' '}
                          {review.writer ? (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 align-baseline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAuthorClick(review.writer);
                              }}
                            >
                              {review.writer.name || '익명'}
                              <i className="bi bi-box-arrow-up-right ms-1"/>
                            </button>
                          ) : (
                            <span>익명</span>
                          )}
                        </div>
                        <span className="small text-secondary">
                          <i className="bi bi-clock me-1"/>
                          {formatDateTime(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 초기 로딩 - 스켈레톤 */}
          {isLoading && reviews.length === 0 && (
            <div className="row g-3">
              {Array.from({length: skeletonCount}).map((_, idx) => (
                <SkeletonCard key={`skeleton-init-${idx}`}/>
              ))}
            </div>
          )}

          {/* Intersection Observer 타겟 - 항상 렌더링 */}
          <div
            ref={loadMoreRef}
            className="text-center py-3"
            style={{display: hasMore && reviews.length > 0 ? 'block' : 'none'}}
          >
            {isLoading && (
              <>
                <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
                <span className="small text-muted">더 불러오는 중...</span>
              </>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 리뷰 상세 모달 */}
      <Modal
        show={!!selectedReview}
        onHide={() => setSelectedReview(null)}
        centered
        size="lg"
        scrollable
        className="app-modal"
      >
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-chat-square-text"/>
              리뷰 상세
            </Modal.Title>
            {selectedReview && (
              <div className="d-flex align-items-center gap-2 flex-wrap mt-1">
                <span className="rating-badge">
                  <i className="bi bi-star-fill"/>
                  {selectedReview.rating?.toFixed(1)}
                </span>
                {getStatusBadge(selectedReview.status)}
              </div>
            )}
          </div>
        </Modal.Header>
        {selectedReview && (
          <Modal.Body>
            <div className="row g-3">
              <DetailField label="작성자" className="col-12 col-md-6">
                {selectedReview.writer && (
                  <button
                    type="button"
                    className="btn btn-link p-0 align-baseline"
                    onClick={() => handleAuthorClick(selectedReview.writer)}
                  >
                    {selectedReview.writer.name || '익명 사용자'}
                    <i className="bi bi-box-arrow-up-right ms-1 small"/>
                  </button>
                )}
              </DetailField>
              <DetailField label="작성자 ID / 소셜" className="col-12 col-md-6" monospace>
                {selectedReview.writer?.userId
                  && `${selectedReview.writer.userId} / ${selectedReview.writer.socialType || '-'}`}
              </DetailField>
              <DetailField label="가게" className="col-12 col-md-6">
                {selectedReview.store && (
                  <button
                    type="button"
                    className="btn btn-link p-0 align-baseline"
                    onClick={() => handleStoreClick(selectedReview.store)}
                  >
                    {selectedReview.store.name}
                    <i className="bi bi-box-arrow-up-right ms-1 small"/>
                  </button>
                )}
              </DetailField>
              <DetailField label="가게 ID / 타입" className="col-12 col-md-6">
                {selectedReview.store?.storeId && (
                  <span className="d-inline-flex align-items-center gap-2">
                    <span className="font-monospace small">{selectedReview.store.storeId}</span>
                    <StoreTypeBadge storeType={selectedReview.store.storeType} size="sm"/>
                  </span>
                )}
              </DetailField>
              <DetailField label="작성일" className="col-12 col-md-6">
                {formatDateTime(selectedReview.createdAt)}
              </DetailField>
              <DetailField label="수정일" className="col-12 col-md-6">
                {formatDateTime(selectedReview.updatedAt)}
              </DetailField>

              <DetailField label="리뷰 내용" className="col-12">
                {selectedReview.contents && (
                  <div className="detail-value-strong detail-value-strong--text">
                    {selectedReview.contents}
                  </div>
                )}
              </DetailField>

              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="col-12">
                  <span className="detail-field__label">
                    첨부 이미지 {selectedReview.images.length}개
                  </span>
                  <div className="row g-2 mt-1">
                    {selectedReview.images.map((image, index) => (
                      <div key={index} className="col-6 col-md-4 col-lg-3">
                        <button
                          type="button"
                          className="review-figure"
                          onClick={() => window.open(image.imageUrl, '_blank', 'noopener,noreferrer')}
                          title="새 창에서 원본 보기"
                        >
                          <img src={image.imageUrl} alt={`리뷰 이미지 ${index + 1}`}/>
                          <span className="review-figure__meta">{image.width} × {image.height}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
        )}
        <Modal.Footer className="justify-content-between">
          <button
            className="btn btn-outline-danger"
            onClick={handleBlindReview}
            disabled={isBlinding || selectedReview?.status === 'FILTERED'}
          >
            {isBlinding ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                처리 중...
              </>
            ) : (
              <>
                <i className="bi bi-eye-slash me-1"/>
                {selectedReview?.status === 'FILTERED' ? '이미 블라인드됨' : '리뷰 블라인드'}
              </>
            )}
          </button>
          <button className="btn btn-outline-secondary" onClick={() => setSelectedReview(null)}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>

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
