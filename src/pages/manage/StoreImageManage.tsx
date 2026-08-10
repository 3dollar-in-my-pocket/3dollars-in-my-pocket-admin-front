import {useCallback, useState} from 'react';
import {Badge, Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeImageApi from '@/api/storeImageApi';
import {StoreImage} from '@/types/storeImage';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import PageHeader from '@/components/common/PageHeader';
import SectionCard from '@/components/common/SectionCard';
import DetailField from '@/components/common/DetailField';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import UserDetailModal from '@/pages/user/UserDetailModal';

import {formatDateTimeNumeric as formatDate} from '@/utils/dateUtils';

/** 카드에 한 번에 노출하는 카테고리 개수 */
const VISIBLE_CATEGORIES = 3;

const StoreImageManage = () => {
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = useCallback(
    (cursor: string | null) => storeImageApi.getAllStoreImages(cursor, 20),
    []
  );

  const {
    items: images,
    setItems: setImages,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreImage>({
    fetcher: fetchImages,
    errorMessage: '가게 이미지를 불러오는데 실패했습니다.'
  });

  // Infinite Scroll 훅 사용
  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
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
    <div>
      <PageHeader description="전체 가게에 등록된 이미지를 조회하고 삭제합니다. 스크롤하면 다음 이미지를 자동으로 불러옵니다."/>

      <SectionCard
        title="가게 이미지 목록"
        icon="bi-images"
        aside={images.length > 0 && (
          <span className="page-count">{images.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}>
          {error ? (
            <ErrorState message={error} onRetry={refresh}/>
          ) : images.length === 0 && !isLoading ? (
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
                    className="item-card item-card--clickable h-100"
                    onClick={() => handleImageClick(image)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleImageClick(image);
                      }
                    }}
                  >
                    <div className="store-image">
                      <img
                        src={image.url}
                        alt="가게 이미지"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                      <Badge bg={getStatusBadgeVariant(image.status)} className="store-image__status">
                        {image.status}
                      </Badge>
                      <span className="store-image__id">ID {image.imageId}</span>
                    </div>

                    <div className="item-card__body">
                      {image.store ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-link p-0 text-start item-card__name text-decoration-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStoreClick(image.store);
                            }}
                          >
                            <i className="bi bi-shop me-1"/>
                            {image.store.name}
                            <i className="bi bi-box-arrow-up-right ms-1 small"/>
                          </button>
                          <p className="item-card__desc mb-0">
                            <i className="bi bi-geo-alt me-1"/>
                            {image.store.address?.fullAddress || '주소 없음'}
                          </p>
                          <div className="form-chips">
                            <span className="rating-badge">
                              <i className="bi bi-star-fill"/>
                              {image.store.rating.toFixed(1)}
                            </span>
                            {image.store.categories?.slice(0, VISIBLE_CATEGORIES).map((category: any, idx: number) => (
                              <span key={idx} className="form-chip">{category.name}</span>
                            ))}
                            {image.store.categories?.length > VISIBLE_CATEGORIES && (
                              <span className="form-chip">
                                +{image.store.categories.length - VISIBLE_CATEGORIES}
                              </span>
                            )}
                          </div>
                        </>
                      ) : (
                        <p className="item-card__desc mb-0">
                          <i className="bi bi-shop-window me-1"/>
                          삭제된 가게
                        </p>
                      )}

                      <div className="d-flex justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                        <div className="small text-secondary">
                          {image.writer ? (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 align-baseline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(image.writer);
                              }}
                            >
                              <i className="bi bi-person-circle me-1"/>
                              {image.writer.name}
                            </button>
                          ) : (
                            <span>
                              <i className="bi bi-person-x me-1"/>
                              탈퇴한 사용자
                            </span>
                          )}
                        </div>
                        <span className="small text-secondary">{formatDate(image.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isLoading && images.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">불러오는 중</span>
              </div>
            </div>
          )}

          {/* Intersection Observer 타겟 - 항상 렌더링 */}
          <div
            ref={loadMoreRef}
            className="text-center py-3"
            style={{display: hasMore && images.length > 0 ? 'block' : 'none'}}
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

      <StoreDetailModal
        show={selectedStore !== null}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
        onAuthorClick={() => {
        }}
        onStoreDeleted={() => {
        }}
      />

      <UserDetailModal
        show={selectedUser !== null}
        onHide={() => setSelectedUser(null)}
        user={selectedUser}
        onStoreClick={() => {
        }}
      />

      {/* 이미지 상세 정보 모달 */}
      <Modal
        show={!!selectedImage}
        onHide={() => setSelectedImage(null)}
        centered
        size="xl"
        scrollable
        className="app-modal"
      >
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-image"/>
              가게 이미지 상세
            </Modal.Title>
            {selectedImage && (
              <p className="app-modal__subtitle font-monospace">{selectedImage.imageId}</p>
            )}
          </div>
        </Modal.Header>
        {selectedImage && (
          <Modal.Body>
            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <div className="store-image store-image--contain">
                  <img
                    src={selectedImage.url}
                    alt="가게 이미지"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                  <Badge bg={getStatusBadgeVariant(selectedImage.status)} className="store-image__status">
                    {selectedImage.status}
                  </Badge>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <div className="row g-3">
                  <DetailField label="이미지 ID" className="col-6" monospace>
                    {selectedImage.imageId}
                  </DetailField>
                  <DetailField label="상태" className="col-6">
                    <Badge bg={getStatusBadgeVariant(selectedImage.status)}>{selectedImage.status}</Badge>
                  </DetailField>
                  <DetailField label="등록일" className="col-6">
                    {formatDate(selectedImage.createdAt)}
                  </DetailField>
                  <DetailField label="수정일" className="col-6">
                    {formatDate(selectedImage.updatedAt)}
                  </DetailField>

                  <DetailField label="가게" className="col-12">
                    {selectedImage.store ? (
                      <div>
                        <button
                          type="button"
                          className="btn btn-link p-0 align-baseline"
                          onClick={() => {
                            handleStoreClick(selectedImage.store);
                            setSelectedImage(null);
                          }}
                        >
                          {selectedImage.store.name}
                          <i className="bi bi-box-arrow-up-right ms-1 small"/>
                        </button>
                        <p className="item-card__desc mb-0">
                          #{selectedImage.store.storeId} · {selectedImage.store.address?.fullAddress || '주소 없음'}
                        </p>
                        <div className="form-chips">
                          <span className="rating-badge">
                            <i className="bi bi-star-fill"/>
                            {selectedImage.store.rating.toFixed(1)}
                          </span>
                          {selectedImage.store.categories?.map((category: any, idx: number) => (
                            <span key={idx} className="form-chip">{category.name}</span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-body-tertiary">삭제된 가게</span>
                    )}
                  </DetailField>

                  <DetailField label="작성자" className="col-12">
                    {selectedImage.writer ? (
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-link p-0 align-baseline"
                          onClick={() => {
                            handleUserClick(selectedImage.writer);
                            setSelectedImage(null);
                          }}
                        >
                          {selectedImage.writer.name}
                          <i className="bi bi-box-arrow-up-right ms-1 small"/>
                        </button>
                        <span className="form-chip">#{selectedImage.writer.userId}</span>
                        <span className="form-chip">{selectedImage.writer.socialType}</span>
                      </div>
                    ) : (
                      <span className="text-body-tertiary">탈퇴한 사용자</span>
                    )}
                  </DetailField>
                </div>
              </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer className="justify-content-between">
          <button
            className="btn btn-outline-danger"
            onClick={() => selectedImage && handleDeleteImage(selectedImage.imageId)}
            disabled={isDeleting || !selectedImage}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                삭제 중...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-1"/>
                이미지 삭제
              </>
            )}
          </button>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => setSelectedImage(null)}>
              닫기
            </button>
            <button
              className="btn btn-primary"
              onClick={() => window.open(selectedImage?.url, '_blank', 'noopener,noreferrer')}
            >
              <i className="bi bi-box-arrow-up-right me-1"/>
              원본 보기
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StoreImageManage;
