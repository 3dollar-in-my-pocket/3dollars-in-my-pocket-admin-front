import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import storeImageApi from "../api/storeImageApi";
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from "../types/store";

const StoreImageHistory = ({storeId, isActive, onAuthorClick}) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (storeId && isActive) {
      fetchImages(true);
    }
  }, [storeId, isActive]);

  const fetchImages = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await storeImageApi.getStoreImages(storeId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('이미지 목록을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const {contents = [], cursor: newCursor = {}} = response.data || {};

      if (reset) {
        setImages(contents);
      } else {
        setImages(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('이미지 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchImages(false);
    }
  }, [hasMore, isLoading, fetchImages]);

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

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
    setShowModal(false);
    setIsDeleting(false);
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

  const handleDeleteImage = async () => {
    const confirmed = window.confirm(`정말로 이 이미지를 삭제하시겠습니까?\n\n등록자: ${selectedImage.writer?.name || '익명 사용자'}\n등록일: ${formatDateTime(selectedImage.createdAt)}\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await storeImageApi.deleteStoreImage(selectedImage.imageId);

      if (response.status === 200 || response.status === 204) {
        toast.success('이미지가 성공적으로 삭제되었습니다.');
        handleCloseModal();
        // 이미지 목록 새로고침
        fetchImages(true);
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('이미지 삭제 실패:', error);
      toast.error('이미지 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
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
            <span className="badge bg-info rounded-pill">
              총 {totalCount.toLocaleString()}개
            </span>
          )}
        </div>
        {totalCount > 0 && (
          <button
            className="btn btn-outline-info btn-sm rounded-pill px-3"
            onClick={() => fetchImages(true)}
            disabled={isLoading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            새로고침
          </button>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="image-container"
        style={{maxHeight: '600px', overflowY: 'auto'}}
      >
        {images.length === 0 && !isLoading ? (
          <div className="text-center py-5">
            <div className="bg-light rounded-circle mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="bi bi-image fs-1 text-secondary"></i>
            </div>
            <h5 className="text-dark mb-2">등록된 이미지가 없습니다</h5>
            <p className="text-muted">아직 이 가게에 등록된 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {images.map((image, index) => (
              <div key={image.imageId || index} className="col-lg-4 col-md-6 col-12">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)'
                  }}
                  onClick={() => handleImageClick(image)}
                  onMouseEnter={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e: any) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* 이미지 */}
                  <div className="position-relative">
                    <img
                      src={image.imageUrl || image.url}
                      alt="Store"
                      className="card-img-top"
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px'
                      }}
                      onError={(e: any) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAzMkMxNi42ODYzIDMyIDEzLjUwNTQgMzAuNjgzOSAxMS4yNzI3IDI4LjQ1MTNDOS4wNDAwNyAyNi4yMTg2IDcuNzI0IDIzLjAzNzYgNy43MjQgMTkuNzIzOUM3LjcyNCAxNi40MTAzIDkuMDQwMDcgMTMuMjI5MyAxMS4yNzI3IDEwLjk5NjdDMTMuNTA1NCA4Ljc2NDA0IDE2LjY4NjMgNy40NDggMjAgNy40NDhDMjMuMzEzNyA7LjQ0OCAyNi40OTQ2IDguNzY0MDQgMjguNzI3MyAxMC45OTY3QzMwLjk1OTkgMTMuMjI5MyAzMi4yNzYgMTYuNDEwMyAzMi4yNzYgMTkuNzIzOUMzMi4yNzYgMjMuMDM3NiAzMC45NTk5IDI2LjIxODYgMjguNzI3MyAyOC40NTEzQzI2LjQ5NDYgMzAuNjgzOSAyMy4zMTM3IDMyIDIwIDMyWk0yMCA5LjI0NzlDMTcuMTY1NSA5LjI0NzkgMTQuNDI3MyAxMC4zNzY0IDEyLjM2ODkgMTIuNDM0OEMxMC4zMTA1IDE0LjQ5MzIgOS4xODE5OSAxNy4yMzE0IDkuMTgxOTkgMjAuMDc1OUM5LjE4MTk5IDIyLjkyMDQgMTAuMzEwNSAyNS42NTg2IDEyLjM2ODkgMjcuNzE3QzE0LjQyNzMgMjkuNzc1MyAxNy4xNjU1IDMwLjkwMzkgMjAgMzAuOTAzOUMyMi44MzQ1IDMwLjkwMzkgMjUuNTcyNyAyOS43NzUzIDI3LjYzMTEgMjcuNzE3QzI5LjY4OTUgMjUuNjU4NiAzMC44MTggMjIuOTIwNCAzMC44MTggMjAuMDc1OUMzMC44MTggMTcuMjMxNCAyOS42ODk1IDE0LjQ5MzIgMjcuNjMxMSAxMi40MzQ4QzI1LjU3MjcgMTAuMzc2NCAyMi44MzQ1IDkuMjQ3OSAyMCA5LjI0NzlaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0yMCAyNi4yNzZDMjEuOTMzIDI2LjI3NiAyMy40NzYgMjQuNzMzIDIzLjQ3NiAyMi44QzIzLjQ3NiAyMC44NjcgMjEuOTMzIDE5LjMyNCAyMCAxOS4zMjRDMTguMDY3IDE5LjMyNCAxNi41MjQgMjAuODY3IDE2LjUyNCAyMi44QzE2LjUyNCAyNC43MzMgMTguMDY3IDI2LjI3NiAyMCAyNi4yNzZaIiBmaWxsPSIjOTk5OTk5Ii8+Cjwvc3ZnPgo=';
                        e.target.style.height = '200px';
                        e.target.style.objectFit = 'contain';
                        e.target.style.backgroundColor = '#f8f9fa';
                      }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-dark bg-opacity-75 rounded-pill">
                        <i className="bi bi-eye me-1"></i>
                        보기
                      </span>
                    </div>
                    {/* 이미지 크기 정보 */}
                    {(image.width && image.height) && (
                      <div className="position-absolute bottom-0 start-0 p-2">
                        <span className="badge bg-info bg-opacity-90 rounded-pill small">
                          {image.width} × {image.height}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="card-body p-3">
                    <div className="d-flex align-items-start gap-2 mb-2">
                      <div className="flex-shrink-0">
                        <div className="bg-info bg-opacity-10 rounded-circle p-1">
                          <i className="bi bi-person-fill text-info"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div
                            className={`d-flex align-items-center gap-1 ${image.writer && onAuthorClick ? 'clickable-author' : ''}`}
                            style={{
                              cursor: image.writer && onAuthorClick ? 'pointer' : 'default',
                              padding: '3px 6px',
                              borderRadius: '5px',
                              transition: 'all 0.2s ease',
                              backgroundColor: 'transparent'
                            }}
                            onClick={(e) => {
                              if (image.writer && onAuthorClick) {
                                e.stopPropagation();
                                onAuthorClick(image.writer);
                              }
                            }}
                            onMouseEnter={(e: any) => {
                              if (image.writer && onAuthorClick) {
                                e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }
                            }}
                            onMouseLeave={(e: any) => {
                              if (image.writer && onAuthorClick) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                          >
                            <span className="text-muted small">등록자:</span>
                            <h6 className={`fw-bold mb-0 ${image.writer && onAuthorClick ? 'text-primary' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>
                              {image.writer?.name || '익명 사용자'}
                            </h6>
                            {image.writer && onAuthorClick && (
                              <i className="bi bi-box-arrow-up-right text-primary" style={{ fontSize: '0.6rem' }}></i>
                            )}
                          </div>
                          {/* 이미지 상태 표시 */}
                          <span className={`badge rounded-pill ${
                            image.status === 'ACTIVE' ? 'bg-success' :
                            image.status === 'INACTIVE' ? 'bg-danger' : 'bg-secondary'
                          } text-white px-2 py-1`} style={{fontSize: '0.65rem'}}>
                            <i className={`bi ${
                              image.status === 'ACTIVE' ? 'bi-image-fill' :
                              image.status === 'INACTIVE' ? 'bi-image-alt' : 'bi-question-circle-fill'
                            } me-1`}></i>
                            {image.status === 'ACTIVE' ? '활성' :
                             image.status === 'INACTIVE' ? '비활성' : '알 수 없음'}
                          </span>
                        </div>
                        <div className="d-flex gap-1 flex-wrap">
                          {image.writer?.userId && (
                            <span
                              className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1"
                              style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-person me-1"></i>
                              ID: {image.writer.userId}
                            </span>
                          )}
                          {image.writer?.socialType && (
                            <span
                              className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                              style={{fontSize: '0.7rem'}}>
                              <i className="bi bi-share me-1"></i>
                              {image.writer.socialType}
                            </span>
                          )}
                          {image.store?.storeType && getStoreTypeBadge(image.store.storeType)}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted" style={{fontSize: '0.8rem'}}>
                        <i className="bi bi-clock me-1"></i>
                        {formatDateTime(image.createdAt)}
                      </span>
                      <button
                        className="btn btn-outline-info btn-sm rounded-pill px-2 py-1"
                        style={{fontSize: '0.7rem'}}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <i className="bi bi-zoom-in me-1"></i>
                        확대
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 버튼 */}
        {hasMore && images.length > 0 && (
          <div className="text-center mt-4">
            <button
              className="btn btn-outline-info rounded-pill px-4 py-2"
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
                  더 많은 이미지 보기
                </>
              )}
            </button>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {isLoading && images.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-info" style={{width: '2rem', height: '2rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <p className="text-muted">이미지를 불러오는 중...</p>
          </div>
        )}
      </div>

      {/* 이미지 확대 모달 */}
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
                  <i className="bi bi-image me-2"></i>
                  이미지 상세보기
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-0 text-center">
                <img
                  src={selectedImage.imageUrl || selectedImage.url}
                  alt="Store"
                  className="img-fluid"
                  style={{maxHeight: '500px', width: 'auto'}}
                />
              </div>
              <div className="modal-footer d-flex justify-content-between">
                <button
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleDeleteImage}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      삭제 중...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>
                      이미지 삭제
                    </>
                  )}
                </button>
                <div className="flex-grow-1 px-3">
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex gap-2 align-items-center">
                      <small className="text-muted">
                        <i className="bi bi-person me-1"></i>
                        등록자: {selectedImage.writer?.name || '익명 사용자'}
                      </small>
                      {selectedImage.writer?.socialType && (
                        <span
                          className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary rounded-pill px-2 py-1"
                          style={{fontSize: '0.7rem'}}>
                          {selectedImage.writer.socialType}
                        </span>
                      )}
                    </div>
                    <small className="text-muted">
                      <i className="bi bi-calendar me-1"></i>
                      등록일: {formatDateTime(selectedImage.createdAt)}
                    </small>
                    {(selectedImage.width && selectedImage.height) && (
                      <small className="text-muted">
                        <i className="bi bi-aspect-ratio me-1"></i>
                        크기: {selectedImage.width} × {selectedImage.height}px
                      </small>
                    )}
                    {selectedImage.store?.storeType && (
                      <div className="mt-1">
                        {getStoreTypeBadge(selectedImage.store.storeType)}
                        {selectedImage.store?.name && (
                          <span className="badge bg-light text-dark border rounded-pill px-2 py-1 ms-1" style={{fontSize: '0.7rem'}}>
                            <i className="bi bi-shop me-1"></i>
                            {selectedImage.store.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <button className="btn btn-secondary rounded-pill px-4" onClick={handleCloseModal}>
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

export default StoreImageHistory;
