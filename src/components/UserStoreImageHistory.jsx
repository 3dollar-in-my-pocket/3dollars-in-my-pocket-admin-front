import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import storeImageApi from "../api/storeImageApi";
import {getStoreTypeDisplayName, getStoreTypeBadgeClass, getStoreTypeIcon} from "../types/store";

const UserStoreImageHistory = ({userId, isActive}) => {
  const [storeImages, setStoreImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (userId && isActive) {
      fetchStoreImages(true);
    }
  }, [userId, isActive]);

  const fetchStoreImages = useCallback(async (reset = false) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await storeImageApi.getUserStoreImages(userId, reset ? null : cursor, 20);
      if (!response?.ok) {
        toast.error('가게 이미지 이력을 불러오는 중 오류가 발생했습니다.');
        return;
      }

      const {contents = [], cursor: newCursor = {}} = response.data || {};

      if (reset) {
        setStoreImages(contents);
      } else {
        setStoreImages(prev => [...prev, ...contents]);
      }

      setHasMore(newCursor.hasMore || false);
      setCursor(newCursor.nextCursor || null);
      setTotalCount(newCursor.totalCount || 0);
    } catch (error) {
      toast.error('가게 이미지 이력을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, cursor, isLoading]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchStoreImages(false);
    }
  }, [hasMore, isLoading, fetchStoreImages]);

  const handleScroll = useCallback((e) => {
    const {scrollTop, scrollHeight, clientHeight} = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading, handleLoadMore]);

  const handleImageClick = (storeImage) => {
    setSelectedImage(storeImage);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const getImageStatusBadge = (status) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE' ? 'bg-success' : 'bg-secondary';
    const statusText = status === 'ACTIVE' ? '노출중인 이미지' : '삭제된 이미지';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        {statusText}
      </span>
    );
  };

  const getStoreStatusBadge = (status) => {
    if (!status) return null;
    const badgeClass = status === 'ACTIVE' ? 'bg-info' : 'bg-warning';
    const statusText = status === 'ACTIVE' ? '운영 중인 가게' : '삭제된 가게'
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        {statusText}
      </span>
    );
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

  const getSalesTypeBadge = (salesType) => {
    if (!salesType) return null;
    const badgeClass = salesType.type === 'ROAD' ? 'bg-success' :
      salesType.type === 'STORE' ? 'bg-primary' : 'bg-secondary';
    return (
      <span className={`badge ${badgeClass} bg-opacity-10 text-dark border rounded-pill px-2 py-1`}>
        {salesType.description || salesType.type}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 이미지 삭제 핸들러
  const handleDeleteImage = async () => {
    if (!selectedImage) return;
    if (!window.confirm('정말로 이 이미지를 삭제하시겠습니까?')) return;
    setIsDeleting(true);
    try {
      const response = await storeImageApi.deleteStoreImage(selectedImage.imageId);
      if (response.status >= 400) {
        toast.error('이미지 삭제에 실패했습니다.');
        setIsDeleting(false);
        return;
      }
      toast.success('이미지가 성공적으로 삭제되었습니다.');
      handleCloseModal();
      fetchStoreImages(true);
    } catch (error) {
      toast.error('이미지 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="px-4 pt-4">
        <div className="d-flex align-items-center justify-content-between mb-4 p-4 rounded-4 shadow-sm"
             style={{
               background: 'linear-gradient(135deg, #e3f2fd 0%, #f8fffe 100%)',
               border: '1px solid rgba(33, 150, 243, 0.1)'
             }}>
          <div className="d-flex align-items-center gap-3">
            <div className="bg-info rounded-circle p-3 shadow-sm"
                 style={{background: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)'}}>
              <i className="bi bi-image text-white fs-5"></i>
            </div>
            <div>
              <h6 className="mb-0 fw-bold text-dark">가게 이미지 등록 이력</h6>
              <small className="text-muted">사용자가 등록한 가게 이미지를 확인하세요</small>
            </div>
          </div>
          {totalCount > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-info px-3 py-2 rounded-pill shadow-sm" style={{fontSize: '0.9rem'}}>
                <i className="bi bi-images me-1"></i>
                총 {totalCount}개
              </span>
            </div>
          )}
        </div>
      </div>
      <div
        className="px-4"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{maxHeight: '500px', overflowY: 'auto'}}
      >
        {storeImages.length === 0 && !isLoading ? (
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
            <h5 className="text-dark mb-2">등록한 이미지가 없습니다</h5>
            <p className="text-muted">아직 등록한 가게 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="row g-3">
            {storeImages.map((storeImage, index) => (
              <div key={storeImage.imageId || index} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}
                  onClick={() => handleImageClick(storeImage)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = '#2196f3';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                  }}
                >
                  <div className="position-relative">
                    <img
                      src={storeImage.url}
                      alt={`가게 이미지 ${storeImage.imageId}`}
                      className="card-img-top"
                      style={{
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '16px 16px 0 0'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="d-none align-items-center justify-content-center bg-light text-muted"
                      style={{
                        height: '200px',
                        borderRadius: '16px 16px 0 0'
                      }}
                    >
                      <div className="text-center">
                        <i className="bi bi-image fs-1 mb-2"></i>
                        <p className="small mb-0">이미지를 불러올 수 없습니다</p>
                      </div>
                    </div>
                    <div className="position-absolute top-0 end-0 m-2">
                      {getImageStatusBadge(storeImage.status)}
                    </div>
                  </div>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold text-dark">{storeImage.store?.name || '가게명 없음'}</h6>
                        <div className="d-flex flex-wrap align-items-center gap-1 mb-2">
                          {getSalesTypeBadge(storeImage.store?.salesType)}
                          {getImageStatusBadge(storeImage.status)}
                          {getStoreStatusBadge(storeImage.store?.status)}
                          {storeImage.store?.storeType && getStoreTypeBadge(storeImage.store.storeType)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <i className="bi bi-geo-alt text-muted small"></i>
                        <span className="text-muted small">{storeImage.store?.address?.fullAddress || '주소 정보 없음'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1 mb-1">
                        <i className="bi bi-star-fill text-warning small"></i>
                        <span className="text-dark fw-medium small">
                            {storeImage.store?.rating ? storeImage.store.rating.toFixed(1) : '0.0'}점
                          </span>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <i className="bi bi-calendar3 text-muted small"></i>
                        <span className="text-muted small">
                            {formatDateTime(storeImage.createdAt)}
                          </span>
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-1">
                      {storeImage.store?.categories?.slice(0, 2).map((category, idx) => (
                        <span key={idx} className="badge rounded-pill px-2 py-1 small"
                              style={{
                                background: 'linear-gradient(135deg, #007bff 0%, #6610f2 100%)',
                                color: 'white',
                                border: 'none',
                                fontSize: '0.7rem'
                              }}>
                            {category?.name || '카테고리'}
                          </span>
                      ))}
                      {storeImage.store?.categories && storeImage.store.categories.length > 2 && (
                        <span className="badge bg-light text-dark border rounded-pill px-2 py-1 small"
                              style={{fontSize: '0.7rem'}}>
                            +{storeImage.store.categories.length - 2}개
                          </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && storeImages.length > 0 && (
          <div className="text-center p-3 bg-light">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">추가 데이터 로딩 중...</p>
          </div>
        )}

        {isLoading && storeImages.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-info" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">이미지 정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요...</p>
          </div>
        )}
      </div>

      {showModal && selectedImage && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 pb-0"
                   style={{background: 'linear-gradient(135deg, #2196f3 0%, #03a9f4 100%)'}}>
                <div className="w-100">
                  <div className="d-flex align-items-center gap-3 text-white">
                    <div>
                      <h4 className="mb-0 fw-bold">가게 이미지 상세</h4>
                      <p className="mb-0 opacity-90">{selectedImage?.store?.name || '가게명 없음'}</p>
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="text-center mb-4">
                      <img
                        src={selectedImage.url}
                        alt={`가게 이미지 ${selectedImage.imageId}`}
                        className="img-fluid rounded-3 shadow-sm"
                        style={{maxHeight: '300px', objectFit: 'cover'}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="d-none align-items-center justify-content-center bg-light text-muted rounded-3"
                        style={{height: '300px'}}
                      >
                        <div className="text-center">
                          <i className="bi bi-image fs-1 mb-2"></i>
                          <p className="mb-0">이미지를 불러올 수 없습니다</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row g-3">
                      <div className="col-12">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-hash text-primary"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">이미지 ID</label>
                            <p className="mb-0 fw-bold text-dark">{selectedImage.imageId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-info bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-shield-check text-info"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">이미지 상태</label>
                            <div>
                              {getImageStatusBadge(selectedImage.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-success bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-shop text-success"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">가게 정보</label>
                            <p className="mb-1 fw-bold text-dark">{selectedImage.store?.name || '가게명 없음'}</p>
                            <div className="d-flex gap-2 mb-1">
                              {getSalesTypeBadge(selectedImage.store?.salesType)}
                              {getStoreStatusBadge(selectedImage.store?.status)}
                            </div>
                            <p
                              className="mb-0 text-muted small">{selectedImage.store?.address?.fullAddress || '주소 정보 없음'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                          <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-calendar3 text-warning"></i>
                          </div>
                          <div>
                            <label className="form-label fw-semibold text-muted mb-1">등록일시</label>
                            <p className="mb-0 fw-bold text-dark">{formatDateTime(selectedImage.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedImage.store?.categories && selectedImage.store.categories.length > 0 && (
                  <div className="mt-4">
                    <h6 className="fw-bold text-dark mb-3">가게 카테고리</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedImage.store.categories.map((category, idx) => (
                        <span key={idx}
                              className="badge bg-primary bg-opacity-10 text-primary border rounded-pill px-3 py-2">
                          {category?.name || '카테고리'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light">
                <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={handleCloseModal}
                        disabled={isDeleting}>
                  <i className="bi bi-x-lg me-2"></i>
                  닫기
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 ms-2"
                  onClick={handleDeleteImage}
                  disabled={isDeleting || selectedImage?.status !== 'ACTIVE'}
                >
                  {isDeleting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      삭제 중...
                    </span>
                  ) : (
                    <span>
                      <i className="bi bi-trash me-2"></i>
                      이미지 삭제
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStoreImageHistory;

