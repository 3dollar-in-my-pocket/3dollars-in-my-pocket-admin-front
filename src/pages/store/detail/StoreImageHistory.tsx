import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeImageApi from "@/api/storeImageApi";

import DetailField from "@/components/common/DetailField";
import HistoryPanel from "@/components/common/HistoryPanel";
import useCursorPagination from "@/hooks/useCursorPagination";
import {StoreImage} from "@/types/storeImage";
import {ActivityAuthor} from "@/types/domain";
import {formatDateTimeShortKo as formatDateTime} from "@/utils/dateUtils";

interface StoreImageHistoryProps {
  storeId: string;
  /** 탭이 활성 상태일 때만 조회합니다. */
  isActive?: boolean;
  /** 등록자 클릭 핸들러. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
}

/** 이미지 상태 코드를 배지 표기로 변환 */
const getImageStatusBadge = (status?: string) => {
  if (status === 'ACTIVE') {
    return {className: 'bg-success-subtle text-success-emphasis', icon: 'bi-image-fill', label: '활성'};
  }
  if (status === 'INACTIVE') {
    return {className: 'bg-danger-subtle text-danger-emphasis', icon: 'bi-image-alt', label: '비활성'};
  }
  return {className: 'bg-secondary-subtle text-secondary-emphasis', icon: 'bi-question-circle-fill', label: '알 수 없음'};
};

/** 이미지 로드 실패 시 표시하는 대체 이미지 */
const FALLBACK_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDEzLjUwNTQgMzAuNjgzOSAxMS4yNzI3IDI4LjQ1MTNDOS4wNDAwNyAyNi4yMTg2IDcuNzI0IDIzLjAzNzYgNy43MjQgMTkuNzIzOUM3LjcyNCAxNi40MTAzIDkuMDQwMDcgMTMuMjI5MyAxMS4yNzI3IDEwLjk5NjdDMTMuNTA1NCA4Ljc2NDA0IDE2LjY4NjMgNy40NDggMjAgNy40NDhDMjMuMzEzNyA7LjQ0OCAyNi40OTQ2IDguNzY0MDQgMjguNzI3MyAxMC45OTY3QzMwLjk1OTkgMTMuMjI5MyAzMi4yNzYgMTYuNDEwMyAzMi4yNzYgMTkuNzIzOUMzMi4yNzYgMjMuMDM3NiAzMC45NTk5IDI2LjIxODYgMjguNzI3MyAyOC40NTEzQzI2LjQ5NDYgMzAuNjgzOSAyMy4zMTM3IDMyIDIwIDMyWk0yMCA5LjI0NzlDMTcuMTY1NSA5LjI0NzkgMTQuNDI3MyAxMC4zNzY0IDEyLjM2ODkgMTIuNDM0OEMxMC4zMTA1IDE0LjQ5MzIgOS4xODE5OSAxNy4yMzE0IDkuMTgxOTkgMjAuMDc1OUM5LjE4MTk5IDIyLjkyMDQgMTAuMzEwNSAyNS42NTg2IDEyLjM2ODkgMjcuNzE3QzE0LjQyNzMgMjkuNzc1MyAxNy4xNjU1IDMwLjkwMzkgMjAgMzAuOTAzOUMyMi44MzQ1IDMwLjkwMzkgMjUuNTcyNyAyOS43NzUzIDI3LjYzMTEgMjcuNzE3QzI5LjY4OTUgMjUuNjU4NiAzMC44MTggMjIuOTIwNCAzMC44MTggMjAuMDc1OUMzMC44MTggMTcuMjMxNCAyOS42ODk1IDE0LjQ5MzIgMjcuNjMxMSAxMi40MzQ4QzI1LjU3MjcgMTAuMzc2NCAyMi44MzQ1IDkuMjQ3OSAyMCA5LjI0NzlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAyNi4yNzZDMjEuOTMzIDI2LjI3NiAyMy40NzYgMjQuNzMzIDIzLjQ3NiAyMi44QzIzLjQ3NiAyMC44NjcgMjEuOTMzIDE5LjMyNCAyMCAxOS4zMjRDMTguMDY3IDE5LjMyNCAxNi41MjQgMjAuODY3IDE2LjUyNCAyMi44QzE2LjUyNCAyNC43MzMgMTguMDY3IDI2LjI3NiAyMCAyNi4yNzZaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';

const StoreImageHistory = ({storeId, isActive, onAuthorClick}: StoreImageHistoryProps) => {
  const [selectedImage, setSelectedImage] = useState<StoreImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchImages = useCallback(
    (cursor: string | null) => storeImageApi.getStoreImages(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: images,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    refresh,
    loadMore
  } = useCursorPagination<StoreImage>({
    fetcher: fetchImages,
    enabled: Boolean(storeId && isActive),
    deps: [storeId]
  });

  const handleImageClick = (image: StoreImage) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setShowModal(false);
    setIsDeleting(false);
  };


  const handleDeleteImage = async () => {
    const confirmed = window.confirm(`정말로 이 이미지를 삭제하시겠습니까?\n\n등록자: ${selectedImage.writer?.name || '익명 사용자'}\n등록일: ${formatDateTime(selectedImage.createdAt)}\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      // imageId는 number, API는 경로 파라미터를 string으로 받습니다. (StoreImageManage와 동일 처리)
      const response = await storeImageApi.deleteStoreImage(String(selectedImage.imageId));

      if (response.ok) {
        toast.success('이미지가 성공적으로 삭제되었습니다.');
        handleCloseModal();
        // 이미지 목록 새로고침
        refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <>
      <HistoryPanel
        title="가게 이미지"
        icon="bi-images"
        count={images.length}
        totalCount={totalCount}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="등록된 이미지가 없습니다"
        emptyDescription="아직 이 가게에 등록된 이미지가 없습니다."
      >
        <div className="row g-3">
          {images.map((image, index) => {
            const statusBadge = getImageStatusBadge(image.status);

            return (
              <div key={image.imageId || index} className="col-12 col-md-6 col-xl-4">
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
                      onError={(e: any) => {
                        e.target.src = FALLBACK_IMAGE;
                        e.target.style.objectFit = 'contain';
                      }}
                    />
                    <span className={`badge store-image__status ${statusBadge.className}`}>
                      <i className={`bi ${statusBadge.icon} me-1`}/>
                      {statusBadge.label}
                    </span>
                    {image.imageId && <span className="store-image__id">ID {image.imageId}</span>}
                  </div>

                  <div className="item-card__body">
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <span className="item-card__desc mt-0">등록자</span>
                      {image.writer && onAuthorClick ? (
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-decoration-none item-card__name clickable-author"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAuthorClick(image.writer);
                          }}
                        >
                          {image.writer.name}
                          <i className="bi bi-box-arrow-up-right ms-1"/>
                        </button>
                      ) : (
                        <h3 className="item-card__name">{image.writer?.name || '익명 사용자'}</h3>
                      )}
                    </div>

                    <div className="form-chips">
                      {image.writer?.userId && (
                        <span className="form-chip">
                          <i className="bi bi-person me-1"/>
                          ID: {image.writer.userId}
                        </span>
                      )}
                      {image.writer?.socialType && (
                        <span className="form-chip">
                          <i className="bi bi-share me-1"/>
                          {image.writer.socialType}
                        </span>
                      )}
                      {image.store?.storeType && <StoreTypeBadge storeType={image.store.storeType}/>}
                    </div>

                    <div className="d-flex justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
                      <span className="item-card__desc mt-0">
                        <i className="bi bi-clock me-1"/>
                        {formatDateTime(image.createdAt)}
                      </span>
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <i className="bi bi-zoom-in me-1"/>
                        확대
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </HistoryPanel>

      {/* 이미지 확대 모달 */}
      <Modal
        show={showModal && Boolean(selectedImage)}
        onHide={handleCloseModal}
        centered
        size="lg"
        scrollable
        className="app-modal"
      >
        <Modal.Header closeButton>
          <div className="min-w-0">
            <Modal.Title as="h2">
              <i className="bi bi-image"/>
              이미지 상세보기
            </Modal.Title>
            {selectedImage?.imageId && (
              <p className="app-modal__subtitle font-monospace">{selectedImage.imageId}</p>
            )}
          </div>
        </Modal.Header>

        {selectedImage && (
          <Modal.Body>
            <div className="store-image store-image--contain mb-3">
              <img
                src={selectedImage.url}
                alt="가게 이미지"
                onError={(e: any) => {
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            <div className="modal-section">
              <h3 className="modal-section__title">
                <i className="bi bi-info-circle"/>
                등록 정보
              </h3>
              <div className="row g-3">
                <DetailField label="등록자" className="col-12 col-md-6">
                  <span className="d-flex align-items-center flex-wrap gap-2">
                    {selectedImage.writer?.name || '익명 사용자'}
                    {selectedImage.writer?.socialType && (
                      <span className="form-chip">{selectedImage.writer.socialType}</span>
                    )}
                  </span>
                </DetailField>
                <DetailField label="등록일" className="col-12 col-md-6">
                  {formatDateTime(selectedImage.createdAt)}
                </DetailField>
                {selectedImage.store?.storeType && (
                  <DetailField label="가게" className="col-12">
                    <span className="d-flex align-items-center flex-wrap gap-2">
                      <StoreTypeBadge storeType={selectedImage.store.storeType}/>
                      {selectedImage.store?.name && (
                        <span className="form-chip">
                          <i className="bi bi-shop me-1"/>
                          {selectedImage.store.name}
                        </span>
                      )}
                    </span>
                  </DetailField>
                )}
              </div>
            </div>
          </Modal.Body>
        )}

        <Modal.Footer className="justify-content-between">
          <button
            className="btn btn-outline-danger"
            onClick={handleDeleteImage}
            disabled={isDeleting}
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
          <button className="btn btn-outline-secondary" onClick={handleCloseModal}>
            닫기
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StoreImageHistory;
