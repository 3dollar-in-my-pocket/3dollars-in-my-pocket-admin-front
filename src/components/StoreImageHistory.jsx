import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import storeImageApi from "../api/storeImageApi";

const StoreImageHistory = ({storeId, isActive}) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
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
                      onError={(e) => {
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
                        <h6 className="fw-bold text-dark mb-1" style={{fontSize: '0.9rem'}}>
                          {image.writer?.name || '익명 사용자'}
                        </h6>
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
              <div className="modal-footer">
                <div className="flex-grow-1 text-start">
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
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={handleCloseModal}>
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
