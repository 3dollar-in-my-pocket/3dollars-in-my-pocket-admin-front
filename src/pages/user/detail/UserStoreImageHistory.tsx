import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {toast} from 'react-toastify';
import storeImageApi from "@/api/storeImageApi";

import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {StoreImage, StoreImageStatus} from "@/types/storeImage";
import {SimpleStore, StoreStatus} from "@/types/store";
import {formatDateTimeKo as formatDateTime} from "@/utils/dateUtils";

interface UserStoreImageHistoryProps {
  userId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 가게 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreClick?: ((store: SimpleStore) => void) | null;
}

const UserStoreImageHistory = ({userId, isActive, onStoreClick}: UserStoreImageHistoryProps) => {
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStoreImages = useCallback(
    (cursor: string | null) => storeImageApi.getUserStoreImages(userId, cursor, 20),
    [userId]
  );

  const {
    items: storeImages,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreImage>({
    fetcher: fetchStoreImages,
    enabled: Boolean(userId && isActive),
    deps: [userId]
  });

  const handleImageClick = (storeImage: StoreImage) => {
    setSelectedImage(storeImage);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const getImageStatusBadge = (status?: StoreImageStatus) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE'
      ? 'bg-success-subtle text-success-emphasis'
      : 'bg-secondary-subtle text-secondary-emphasis';
    const statusText = status === 'ACTIVE' ? '노출중인 이미지' : '삭제된 이미지';
    return (
      <span className={`badge ${badgeClass}`}>
        {statusText}
      </span>
    );
  };

  const getStoreStatusBadge = (status?: StoreStatus) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE'
      ? 'bg-info-subtle text-info-emphasis'
      : 'bg-warning-subtle text-warning-emphasis';
    const statusText = status === 'ACTIVE' ? '운영 중인 가게' : '삭제된 가게'
    return (
      <span className={`badge ${badgeClass}`}>
        {statusText}
      </span>
    );
  };


  // 이미지 삭제 핸들러
  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    if (!window.confirm('정말로 이 이미지를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      // imageId는 number, API는 경로 파라미터를 string으로 받습니다. (StoreImageManage와 동일 처리)
      const response = await storeImageApi.deleteStoreImage(String(selectedImage.imageId));
      if (response.status >= 400) {
        setIsDeleting(false);
        return;
      }
      toast.success('이미지가 성공적으로 삭제되었습니다.');
      handleCloseModal();
      refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <HistoryPanel
        title="가게 이미지 등록 이력"
        icon="bi-image"
        count={storeImages.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="등록한 이미지가 없습니다"
        emptyDescription="아직 등록한 가게 이미지가 없습니다."
      >
        <div className="row g-3">
          {storeImages.map((storeImage, index) => (
            <div key={storeImage.imageId || index} className="col-md-6 col-lg-4">
              <div
                className="item-card item-card--clickable h-100"
                role="button"
                tabIndex={0}
                onClick={() => handleImageClick(storeImage)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    handleImageClick(storeImage);
                  }
                }}
              >
                <div className="store-post__image position-relative" style={{aspectRatio: 1}}>
                  <img
                    src={storeImage.url}
                    alt={`가게 이미지 ${storeImage.imageId}`}
                    loading="lazy"
                    onError={(e: any) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div className="d-none align-items-center justify-content-center w-100 h-100 bg-light text-muted">
                    <div className="text-center">
                      <i className="bi bi-image fs-1"/>
                      <p className="small mb-0">이미지를 불러올 수 없습니다</p>
                    </div>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2">
                    {getImageStatusBadge(storeImage.status)}
                  </div>
                </div>
                <div className="item-card__body">
                  {storeImage.store && onStoreClick ? (
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author text-start"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStoreClick(storeImage.store);
                      }}
                    >
                      {storeImage.store.name || '가게명 없음'}
                      <i className="bi bi-box-arrow-up-right ms-1"/>
                    </button>
                  ) : (
                    <h3 className="item-card__name">{storeImage.store?.name || '가게명 없음'}</h3>
                  )}

                  <div className="d-flex align-items-center flex-wrap gap-1 mt-2">
                    {getImageStatusBadge(storeImage.status)}
                    {getStoreStatusBadge(storeImage.store?.status)}
                    {storeImage.store?.storeType && <StoreTypeBadge storeType={storeImage.store.storeType}/>}
                  </div>

                  <p className="item-card__desc">
                    <i className="bi bi-geo-alt me-1"/>
                    {storeImage.store?.address?.fullAddress || '주소 정보 없음'}
                  </p>

                  <div className="d-flex align-items-center flex-wrap gap-1 mt-2">
                    <span className="rating-badge">
                      <i className="bi bi-star-fill"/>
                      {storeImage.store?.rating ? storeImage.store.rating.toFixed(1) : '0.0'}점
                    </span>
                    {storeImage.store?.categories?.slice(0, 2).map((category, idx) => (
                      <span key={idx} className="badge bg-primary-subtle text-primary-emphasis">
                        {category?.name || '카테고리'}
                      </span>
                    ))}
                    {storeImage.store?.categories && storeImage.store.categories.length > 2 && (
                      <span className="badge bg-secondary-subtle text-secondary-emphasis">
                        +{storeImage.store.categories.length - 2}개
                      </span>
                    )}
                  </div>

                  <p className="item-card__desc">
                    <i className="bi bi-calendar3 me-1"/>
                    {formatDateTime(storeImage.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </HistoryPanel>

      {showModal && selectedImage && (
        <div
          className="modal fade show"
          style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}
          onClick={handleCloseModal}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-image text-info me-2"/>
                  가게 이미지 상세
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal} disabled={isDeleting}/>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="store-post__image" style={{aspectRatio: 1}}>
                      <img
                        src={selectedImage.url}
                        alt={`가게 이미지 ${selectedImage.imageId}`}
                        loading="lazy"
                        onError={(e: any) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="d-none align-items-center justify-content-center w-100 h-100 bg-light text-muted">
                        <div className="text-center">
                          <i className="bi bi-image fs-1"/>
                          <p className="mb-0">이미지를 불러올 수 없습니다</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label fw-bold">이미지 ID</label>
                        <p className="form-control-plaintext">{selectedImage.imageId}</p>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">이미지 상태</label>
                        <div>
                          {getImageStatusBadge(selectedImage.status)}
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">가게 정보</label>
                        <p className="form-control-plaintext mb-1">{selectedImage.store?.name || '가게명 없음'}</p>
                        <div className="d-flex gap-2 flex-wrap mb-1">
                          {getStoreStatusBadge(selectedImage.store?.status)}
                        </div>
                        <p className="item-card__desc mt-0">
                          {selectedImage.store?.address?.fullAddress || '주소 정보 없음'}
                        </p>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">등록일시</label>
                        <p className="form-control-plaintext">{formatDateTime(selectedImage.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {selectedImage.store?.categories && selectedImage.store.categories.length > 0 && (
                    <div className="col-12">
                      <label className="form-label fw-bold">가게 카테고리</label>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedImage.store.categories.map((category, idx) => (
                          <span key={idx} className="badge bg-primary-subtle text-primary-emphasis">
                            {category?.name || '카테고리'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteImage}
                  disabled={isDeleting || selectedImage?.status !== 'ACTIVE'}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"/>
                      이미지 삭제
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

export default UserStoreImageHistory;
