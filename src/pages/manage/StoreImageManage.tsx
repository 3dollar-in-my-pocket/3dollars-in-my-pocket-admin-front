import { useEffect, useState, useCallback, useRef } from 'react';
import { Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import storeImageApi from '../../api/storeImageApi';
import { StoreImage } from '../../types/storeImage';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import EmptyState from '../../components/common/EmptyState';
import StoreDetailModal from '../store/StoreDetailModal';
import UserDetailModal from '../user/UserDetailModal';

import {formatDateTimeNumeric as formatDate} from '../../utils/dateUtils';

const StoreImageManage = () => {
  const [images, setImages] = useState<StoreImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // cursor와 isLoading을 ref로 관리하여 useCallback 의존성 문제 해결
  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const fetchImages = useCallback(async (reset = false) => {
    // 중복 호출 방지
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    try {
      const response = await storeImageApi.getAllStoreImages(reset ? null : cursorRef.current, 20);
      if (!response?.ok) {
        return;
      }

      const { contents = [], cursor: newCursor } = response.data || { contents: [], cursor: { hasMore: false, nextCursor: null } };

      if (reset) {
        setImages(contents);
        cursorRef.current = null; // reset 시 cursor 초기화
      } else {
        setImages(prev => [...prev, ...contents]);
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
    fetchImages(true);
  }, [fetchImages]);

  // Infinite Scroll 훅 사용
  const { scrollContainerRef, loadMoreRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchImages(false),
    threshold: 0.1
  });

  const handleStoreClick = (store: any) => {
    if (store) {
      setSelectedStore(store);
    }
  };

  const handleUserClick = (user: any) => {
    if (user) {
      setSelectedUser(user);
    }
  };

  const handleImageClick = (image: StoreImage) => {
    setSelectedImage(image);
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('정말로 이 이미지를 삭제하시겠습니까?\n삭제된 이미지는 복구할 수 없습니다.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await storeImageApi.deleteStoreImage(imageId.toString());

      if (response?.ok) {
        toast.success('이미지가 성공적으로 삭제되었습니다.');
        setSelectedImage(null);
        // 목록에서 삭제된 이미지 제거
        setImages(prev => prev.filter(img => img.imageId !== imageId));
      } else {
        throw new Error(response?.message || '삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('이미지 삭제 실패:', error);
      toast.error(error.message || '이미지 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'DELETED':
        return 'danger';
      default:
        return 'primary';
    }
  };


  return (
    <div className="container-fluid py-4">
      {/* 제목 */}
      <h2 className="fw-bold mb-4 text-primary">🖼️ 가게 이미지 관리</h2>

      {/* 안내 메시지 */}
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
                <span className="d-none d-md-inline">전체 가게에 등록된 모든 이미지를 조회합니다. 스크롤하여 더 많은 이미지를 자동으로 불러옵니다.</span>
                <span className="d-inline d-md-none">모든 가게 이미지 조회. 스크롤 시 자동 로드.</span>
              </small>
              {images.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  <span className="badge bg-primary rounded-pill px-2 py-1" style={{fontSize: '0.7rem'}}>
                    <i className="bi bi-check-circle me-1"></i>
                    {images.length.toLocaleString()}개
                  </span>
                  {hasMore && (
                    <span className="badge bg-info rounded-pill px-2 py-1" style={{fontSize: '0.7rem'}}>
                      <i className="bi bi-arrow-down-circle me-1"></i>
                      <span className="d-none d-sm-inline">더 많은 이미지 있음</span>
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
        className="image-container"
        style={{maxHeight: 'calc(100vh - 280px)', overflowY: 'auto'}}
      >
        {/* 빈 상태 */}
        {images.length === 0 && !isLoading ? (
          <EmptyState
            icon="bi-image"
            title="등록된 가게 이미지가 없습니다"
            description="아직 등록된 가게 이미지가 없습니다."
          />
        ) : (
          <div className="row g-3">
            {images.map((image) => (
              <div key={image.imageId} className="col-12 col-md-6 col-xl-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '16px',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleImageClick(image)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                  }}
                >
                  {/* 이미지 섹션 */}
                  <div className="position-relative" style={{ height: '240px' }}>
                    <img
                      src={image.url}
                      alt="가게 이미지"
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                    {/* 상태 배지 오버레이 */}
                    <div className="position-absolute top-0 end-0 p-3">
                      <Badge
                        bg={getStatusBadgeVariant(image.status)}
                        className="px-3 py-2"
                        style={{
                          fontSize: '0.75rem',
                          borderRadius: '12px',
                          fontWeight: '600',
                          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.2)'
                        }}
                      >
                        {image.status}
                      </Badge>
                    </div>
                    {/* 이미지 ID 오버레이 */}
                    <div className="position-absolute bottom-0 start-0 p-3">
                      <span
                        className="badge bg-dark bg-opacity-75 px-3 py-2"
                        style={{
                          fontSize: '0.7rem',
                          borderRadius: '12px',
                          fontWeight: '500',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        ID: {image.imageId}
                      </span>
                    </div>
                  </div>

                  {/* 정보 섹션 */}
                  <div className="card-body p-4">
                    {/* 가게 정보 */}
                    {image.store ? (
                      <div className="mb-3">
                        <div
                          className="d-flex align-items-center gap-2 mb-2"
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoreClick(image.store);
                          }}
                        >
                          <i className="bi bi-shop text-primary fs-5"></i>
                          <h6 className="fw-bold text-primary mb-0 text-decoration-underline" style={{ fontSize: '1.1rem' }}>
                            {image.store.name}
                          </h6>
                        </div>

                        <div className="d-flex align-items-center gap-3 mb-2 text-muted">
                          <div className="d-flex align-items-center gap-1">
                            <i className="bi bi-star-fill text-warning"></i>
                            <span className="fw-medium">{image.store.rating.toFixed(1)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <i className="bi bi-geo-alt"></i>
                            <span className="text-truncate" style={{ maxWidth: '200px' }}>
                              {image.store.address?.fullAddress || '주소 없음'}
                            </span>
                          </div>
                        </div>

                        {/* 카테고리 */}
                        {image.store.categories && image.store.categories.length > 0 && (
                          <div className="d-flex flex-wrap gap-1">
                            {image.store.categories.slice(0, 3).map((category: any, idx: number) => (
                              <span
                                key={idx}
                                className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                                style={{ fontSize: '0.7rem' }}
                              >
                                {category.name}
                              </span>
                            ))}
                            {image.store.categories.length > 3 && (
                              <span
                                className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                                style={{ fontSize: '0.7rem' }}
                              >
                                +{image.store.categories.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-3 text-center text-muted">
                        <i className="bi bi-shop fs-1 mb-2 d-block text-secondary"></i>
                        <span>삭제된 가게</span>
                      </div>
                    )}

                    {/* 하단 정보 */}
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: image.writer ? 'pointer' : 'default' }}
                        onClick={(e) => {
                          if (image.writer) {
                            e.stopPropagation();
                            handleUserClick(image.writer);
                          }
                        }}
                      >
                        <i className="bi bi-person-circle text-muted"></i>
                        <span className={`small ${image.writer ? 'text-primary text-decoration-underline' : 'text-muted'}`}>
                          {image.writer ? image.writer.name : '탈퇴한 사용자'}
                        </span>
                      </div>
                      <small className="text-muted">
                        {formatDate(image.createdAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Intersection Observer 타겟 - 항상 렌더링 */}
        <div
          ref={loadMoreRef}
          className="text-center mt-3 mb-3"
          style={{
            display: hasMore && images.length > 0 ? 'block' : 'none',
            minHeight: '40px'
          }}
        >
          {isLoading && (
            <div className="d-flex justify-content-center align-items-center py-3">
              <div className="spinner-border text-primary" role="status" style={{width: '2rem', height: '2rem'}}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-3 text-muted">더 많은 이미지를 불러오는 중...</span>
            </div>
          )}
        </div>
      </div>

      <StoreDetailModal
        show={selectedStore !== null}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={() => {}}
        onStoreDeleted={() => {}}
      />

      <UserDetailModal
        show={selectedUser !== null}
        onHide={() => setSelectedUser(null)}
        user={selectedUser}
        onStoreClick={() => {}}
      />

      {/* 이미지 상세 정보 모달 */}
      {selectedImage && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setSelectedImage(null)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-image me-2 text-primary"></i>
                  가게 이미지 상세 정보
                </h5>
                <button type="button" className="btn-close" onClick={() => setSelectedImage(null)}></button>
              </div>

              <div className="modal-body p-0">
                <div className="row g-0">
                  {/* 이미지 섹션 */}
                  <div className="col-md-6">
                    <div className="position-relative" style={{ height: '500px' }}>
                      <img
                        src={selectedImage.url}
                        alt="가게 이미지"
                        className="w-100 h-100"
                        style={{ objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                      {/* 상태 배지 */}
                      <div className="position-absolute top-0 end-0 p-3">
                        <Badge
                          bg={getStatusBadgeVariant(selectedImage.status)}
                          className="px-3 py-2"
                          style={{
                            fontSize: '0.85rem',
                            borderRadius: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {selectedImage.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 정보 섹션 */}
                  <div className="col-md-6">
                    <div className="p-4">
                      {/* 기본 정보 */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">기본 정보</h6>
                        <div className="card bg-light border-0">
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-6">
                                <label className="form-label small text-muted fw-medium">이미지 ID</label>
                                <div className="fw-bold">{selectedImage.imageId}</div>
                              </div>
                              <div className="col-6">
                                <label className="form-label small text-muted fw-medium">상태</label>
                                <div>
                                  <Badge bg={getStatusBadgeVariant(selectedImage.status)}>
                                    {selectedImage.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="col-6">
                                <label className="form-label small text-muted fw-medium">등록일</label>
                                <div className="fw-medium">{formatDate(selectedImage.createdAt)}</div>
                              </div>
                              <div className="col-6">
                                <label className="form-label small text-muted fw-medium">수정일</label>
                                <div className="fw-medium">{formatDate(selectedImage.updatedAt)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 가게 정보 */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">가게 정보</h6>
                        {selectedImage.store ? (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-shop text-primary fs-4"></i>
                                <div>
                                  <h6 className="fw-bold mb-0">{selectedImage.store.name}</h6>
                                  <small className="text-muted">ID: {selectedImage.store.storeId}</small>
                                </div>
                              </div>

                              <div className="row g-3">
                                <div className="col-12">
                                  <label className="form-label small text-muted fw-medium">평점</label>
                                  <div className="d-flex align-items-center gap-2">
                                    <i className="bi bi-star-fill text-warning"></i>
                                    <span className="fw-bold">{selectedImage.store.rating.toFixed(1)}</span>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <label className="form-label small text-muted fw-medium">주소</label>
                                  <div className="fw-medium">{selectedImage.store.address?.fullAddress || '주소 없음'}</div>
                                </div>
                                {selectedImage.store.categories && selectedImage.store.categories.length > 0 && (
                                  <div className="col-12">
                                    <label className="form-label small text-muted fw-medium">카테고리</label>
                                    <div className="d-flex flex-wrap gap-1">
                                      {selectedImage.store.categories.map((category: any, idx: number) => (
                                        <span
                                          key={idx}
                                          className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                                          style={{ fontSize: '0.75rem' }}
                                        >
                                          {category.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStoreClick(selectedImage.store);
                                    setSelectedImage(null);
                                  }}
                                >
                                  <i className="bi bi-info-circle me-1"></i>
                                  가게 상세 정보
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center text-muted">
                              <i className="bi bi-shop fs-1 mb-2 d-block"></i>
                              <span>삭제된 가게</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 작성자 정보 */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">작성자 정보</h6>
                        {selectedImage.writer ? (
                          <div className="card border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-person-circle text-success fs-4"></i>
                                <div>
                                  <h6 className="fw-bold mb-0">{selectedImage.writer.name}</h6>
                                  <small className="text-muted">ID: {selectedImage.writer.userId}</small>
                                </div>
                              </div>

                              <div className="d-flex justify-content-between align-items-center">
                                <span className="badge bg-secondary">
                                  {selectedImage.writer.socialType}
                                </span>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(selectedImage.writer);
                                    setSelectedImage(null);
                                  }}
                                >
                                  <i className="bi bi-person me-1"></i>
                                  사용자 상세 정보
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center text-muted">
                              <i className="bi bi-person-x fs-1 mb-2 d-block"></i>
                              <span>탈퇴한 사용자</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteImage(selectedImage.imageId)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-1" role="status"></div>
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-1"></i>
                      이미지 삭제
                    </>
                  )}
                </button>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedImage(null)}>
                    닫기
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.open(selectedImage.url, '_blank')}
                  >
                    <i className="bi bi-arrow-up-right-square me-1"></i>
                    원본 이미지 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreImageManage;