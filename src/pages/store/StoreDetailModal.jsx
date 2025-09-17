import {useEffect, useState} from 'react';
import {Modal, Tab, Tabs} from 'react-bootstrap';
import {
  formatCount,
  formatRating,
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon,
  getOpenStatusBadgeClass,
  getOpenStatusDisplayName,
  getSalesTypeBadgeClass,
  getSalesTypeDisplayName,
  getStoreStatusBadgeClass,
  getStoreStatusDisplayName,
  getStoreTypeDisplayName,
  getStoreTypeBadgeClass,
  getStoreTypeIcon,
  getWriterTypeBadgeClass
} from '../../types/store';
import storeApi from '../../api/storeApi';
import ActivityHistory from '../../components/ActivityHistory';
import StoreReviewHistory from '../../components/StoreReviewHistory';
import StoreVisitHistory from '../../components/StoreVisitHistory';
import StoreImageHistory from '../../components/StoreImageHistory';
import StoreReportHistory from '../../components/StoreReportHistory';
import {toast} from 'react-toastify';

const StoreDetailModal = ({show, onHide, store}) => {
  const [storeDetail, setStoreDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activitySubTab, setActivitySubTab] = useState(null);

  useEffect(() => {
    if (show && store) {
      fetchStoreDetail();
    }
  }, [show, store]);

  const fetchStoreDetail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await storeApi.getStoreDetail(store.storeId);
      if (!response.ok) {
        return;
      }

      // 서버 응답 구조에 맞게 직접 데이터 추출
      const data = response.data;
      setStoreDetail(data);
    } catch (error) {
      console.error('가게 상세 정보 조회 실패:', error);

      // 네트워크 오류나 기타 예외 처리
      const errorMessage = error.response?.status
        ? `서버 오류가 발생했습니다. (${error.response.status})`
        : '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStoreDetail(null);
    setActiveTab('basic');
    setError(null);
    setIsDeleting(false);
    setActivitySubTab(null);
    onHide();
  };

  const handleReviewClick = () => {
    setActiveTab('activity');
    setActivitySubTab('reviews');
  };

  const handleReportClick = () => {
    setActiveTab('activity');
    setActivitySubTab('reports');
  };

  const handleDeleteStore = async () => {
    const confirmed = window.confirm(`정말로 "${store.name}" 가게를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await storeApi.deleteStore(store.storeId);

      if (response.status === 200 || response.status === 204) {
        toast.success('가게가 성공적으로 삭제되었습니다.');
        handleClose();
        // 부모 컴포넌트에 삭제 완료를 알려 목록을 새로고침할 수 있도록 함
        if (window.location.reload) {
          setTimeout(() => window.location.reload(), 1000);
        }
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('가게 삭제 실패:', error);
      toast.error('가게 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getStoreStatusBadgeClass(status)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-shop me-1"></i>
        {getStoreStatusDisplayName(status)}
      </span>
    );
  };

  const getActivitiesBadge = (activitiesStatus) => {
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getActivitiesStatusBadgeClass(activitiesStatus)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-activity me-1"></i>
        {getActivitiesStatusDisplayName(activitiesStatus)}
      </span>
    );
  };

  const getSalesTypeBadge = (salesType) => {
    if (!salesType) return null;
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getSalesTypeBadgeClass(salesType.type)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-shop me-1"></i>
        {getSalesTypeDisplayName(salesType.type)}
      </span>
    );
  };

  const getOpenStatusBadge = (openStatus) => {
    if (!openStatus) return null;
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getOpenStatusBadgeClass(openStatus.status)} bg-opacity-10 text-dark border`}>
        <i className={`bi ${openStatus.isOpening ? 'bi-unlock' : 'bi-lock'} me-1`}></i>
        {getOpenStatusDisplayName(openStatus.status)}
      </span>
    );
  };

  const getOwnerBadge = (owner) => {
    if (!owner || !owner.name) return null;
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getWriterTypeBadgeClass(owner.writerType)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-person me-1"></i>
        {owner.name}
      </span>
    );
  };

  const getStoreTypeBadge = (storeType) => {
    if (!storeType) return null;
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getStoreTypeBadgeClass(storeType)} text-white border`}>
        <i className={`bi ${getStoreTypeIcon(storeType)} me-1`}></i>
        {getStoreTypeDisplayName(storeType)}
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

  const getCategoryList = (categories) => {
    if (!categories || categories.length === 0) {
      return (
        <div className="text-center py-4">
          <div className="bg-light rounded-circle mx-auto mb-3"
               style={{width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <i className="bi bi-tags fs-3 text-secondary"></i>
          </div>
          <h6 className="text-dark mb-1">카테고리 정보가 없습니다</h6>
          <p className="text-muted small">등록된 카테고리가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {categories.map((category, index) => (
          <div key={category.categoryId || index} className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100" style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: '16px'
            }}>
              <div className="card-body p-3">
                <div className="d-flex flex-column align-items-center text-center">
                  <div className="mb-3">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="rounded-circle"
                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3" style={{
                      width: '50px',
                      height: '50px',
                      display: category.imageUrl ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`bi ${getCategoryIcon(category.categoryId)} text-primary`}></i>
                    </div>
                  </div>
                  <h6 className="fw-bold text-dark mb-1 small">{category.name}</h6>
                  <p className="text-muted mb-2 small" style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                    {category.description}
                  </p>
                  {category.classification && (
                    <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1"
                          style={{fontSize: '0.7rem'}}>
                      <i className="bi bi-tag me-1"></i>
                      {category.classification.description}
                    </span>
                  )}
                  {category.isNew && (
                    <span className="badge bg-warning text-dark ms-1 rounded-pill px-2 py-1"
                          style={{fontSize: '0.7rem'}}>
                      <i className="bi bi-sparkles me-1"></i>
                      NEW
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!show || !store) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      className="store-detail-modal"
      style={{maxWidth: '95vw'}}
      dialogClassName="modal-90w"
    >
      <Modal.Header
        closeButton
        className="border-0 pb-0 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%)',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          zIndex: 1
        }}
      >
        {/* 배경 패턴 */}
        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 70% 20%, white 1px, transparent 1px)',
          backgroundSize: '20px 20px, 15px 15px',
          pointerEvents: 'none',
          zIndex: -1
        }}></div>
        <div className="w-100 position-relative" style={{paddingRight: '60px'}}>
          <div className="d-flex align-items-center gap-4">
            <div className="bg-orange bg-opacity-20 rounded-circle p-3 shadow-lg" style={{background: 'rgba(255, 152, 0, 0.2)'}}>
              <i className="bi bi-shop fs-3" style={{color: '#212529'}}></i>
            </div>
            <div className="flex-grow-1">
              <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2 mb-2">
                <Modal.Title className="mb-0 fs-2 fw-bold" style={{color: '#212529'}}>
                  가게 상세 정보
                </Modal.Title>
                <div className="bg-orange bg-opacity-20 rounded-pill px-3 py-1" style={{background: 'rgba(255, 152, 0, 0.2)', border: '1px solid rgba(255, 152, 0, 0.3)'}}>
                  <small className="fw-semibold" style={{color: '#212529'}}>#{store.storeId}</small>
                </div>
              </div>
              <p className="mb-0 fs-6" style={{color: '#495057'}}>
                <i className="bi bi-geo-alt me-2"></i>
                {store.name}의 상세 정보를 확인하고 관리하세요
              </p>
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h5 className="text-dark mb-1">정보를 불러오는 중...</h5>
            <p className="text-muted">잠시만 기다려주세요.</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">
            <div className="mb-4">
              <div className="bg-danger bg-opacity-10 rounded-circle mx-auto" style={{
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
              </div>
            </div>
            <h5 className="text-dark mb-2">오류가 발생했습니다</h5>
            <p className="text-muted mb-3">{error}</p>
            <button
              className="btn btn-outline-primary rounded-pill px-4"
              onClick={() => fetchStoreDetail()}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              다시 시도
            </button>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="nav-fill border-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 167, 38, 0.05) 100%)',
              borderBottom: '3px solid rgba(255, 107, 107, 0.15)'
            }}
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={
                <span className="d-flex align-items-center gap-2 px-3 py-2">
                  <div className="rounded-circle p-1" style={{background: 'rgba(220, 53, 69, 0.2)'}}>
                    <i className="bi bi-shop" style={{color: '#dc3545'}}></i>
                  </div>
                  <span className="fw-bold" style={{color: '#dc3545'}}>기본 정보</span>
                </span>
              }
            >
              <div className="p-4">
                <div className="row justify-content-center">
                  <div className="col-md-10">
                    {/* 일반 정보 섹션 */}
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-header bg-light border-0 p-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-shop text-primary"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-dark">일반 정보</h5>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <div className="text-center mb-4">
                          <h4 className="fw-bold text-dark mb-1">{storeDetail?.name || store.name}</h4>
                          <div className="d-flex justify-content-center gap-2 mb-3 flex-wrap">
                            {getStatusBadge(storeDetail?.status || store.status)}
                            {getActivitiesBadge(storeDetail?.activitiesStatus || store.activitiesStatus)}
                            {getSalesTypeBadge(storeDetail?.salesType)}
                            {getOpenStatusBadge(storeDetail?.openStatus)}
                            {getStoreTypeBadge(storeDetail?.storeType || store.storeType)}
                          </div>
                          {storeDetail?.owner && (
                            <div className="d-flex justify-content-center gap-2 mb-3">
                              {getOwnerBadge(storeDetail.owner)}
                            </div>
                          )}
                          {storeDetail?.metadata && (
                            <div className="row g-2 mt-3">
                              <div className="col-4">
                                <div
                                  className="bg-primary bg-opacity-10 rounded p-2 position-relative"
                                  style={{cursor: 'pointer', transition: 'all 0.2s ease'}}
                                  onClick={handleReviewClick}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(13, 110, 253, 0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <div className="text-primary fw-bold">{formatCount(storeDetail.metadata.reviewCount)}</div>
                                  <div className="text-muted small d-flex align-items-center justify-content-between">
                                    <span>리뷰</span>
                                    <i className="bi bi-arrow-right text-primary" style={{fontSize: '0.7rem'}}></i>
                                  </div>
                                </div>
                              </div>
                              <div className="col-4">
                                <div className="bg-success bg-opacity-10 rounded p-2">
                                  <div
                                    className="text-success fw-bold">{formatCount(storeDetail.metadata.subscriberCount)}</div>
                                  <div className="text-muted small">구독자</div>
                                </div>
                              </div>
                              <div className="col-4">
                                <div
                                  className="bg-danger bg-opacity-10 rounded p-2 position-relative"
                                  style={{cursor: 'pointer', transition: 'all 0.2s ease'}}
                                  onClick={handleReportClick}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <div className="text-danger fw-bold">{formatCount(storeDetail.metadata.reportCount)}</div>
                                  <div className="text-muted small d-flex align-items-center justify-content-between">
                                    <span>신고</span>
                                    <i className="bi bi-arrow-right text-danger" style={{fontSize: '0.7rem'}}></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="row g-4">
                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-hash text-primary"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">가게 ID</label>
                                <p className="mb-0 fw-bold text-dark">{storeDetail?.storeId || store.storeId}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-star text-warning"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">평균 평점</label>
                                <p
                                  className="mb-0 fw-bold text-dark">{formatRating(storeDetail?.rating || store.rating)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-success bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-geo-alt text-success"></i>
                              </div>
                              <div className="flex-grow-1">
                                <label className="form-label fw-semibold text-muted mb-1">주소</label>
                                <p className="mb-0 fw-bold text-dark">
                                  {(storeDetail?.address || store.address)?.fullAddress || '주소 정보 없음'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-calendar3 text-info"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">생성일</label>
                                <p
                                  className="mb-0 fw-bold text-dark">{formatDateTime(storeDetail?.createdAt || store.createdAt)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-secondary bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-clock-history text-secondary"></i>
                              </div>
                              <div>
                                <label className="form-label fw-semibold text-muted mb-1">마지막 수정일</label>
                                <p
                                  className="mb-0 fw-bold text-dark">{formatDateTime(storeDetail?.updatedAt || store.updatedAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 카테고리 정보 섹션 */}
                    <div className="card border-0 shadow-sm">
                      <div className="card-header bg-light border-0 p-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-info bg-opacity-10 rounded-circle p-2">
                            <i className="bi bi-tags text-info"></i>
                          </div>
                          <h5 className="mb-0 fw-bold text-dark">카테고리 정보</h5>
                          {store.categories && store.categories.length > 0 && (
                            <span className="badge bg-info ms-auto px-3 py-2 rounded-pill">
                              총 {store.categories.length}개
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="card-body p-4">
                        {getCategoryList(storeDetail?.categories || store.categories)}
                      </div>
                    </div>

                    {/* 메뉴 정보 섹션 */}
                    {storeDetail?.menus && storeDetail.menus.length > 0 && (
                      <div className="card border-0 shadow-sm mt-4">
                        <div className="card-header bg-light border-0 p-4">
                          <div className="d-flex align-items-center gap-2">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-2">
                              <i className="bi bi-menu-button-wide text-warning"></i>
                            </div>
                            <h5 className="mb-0 fw-bold text-dark">메뉴 정보</h5>
                            <span className="badge bg-warning ms-auto px-3 py-2 rounded-pill">
                              총 {storeDetail.menus.length}개
                            </span>
                          </div>
                        </div>
                        <div className="card-body p-4">
                          <div className="row g-3">
                            {storeDetail.menus.map((menu, index) => (
                              <div key={index} className="col-md-6 col-lg-4">
                                <div className="card border-0 shadow-sm h-100" style={{
                                  background: 'linear-gradient(135deg, #fff8dc 0%, #ffffff 100%)',
                                  borderRadius: '16px'
                                }}>
                                  <div className="card-body p-3">
                                    <div className="d-flex flex-column align-items-center text-center">
                                      <div className="mb-3">
                                        {menu.category?.imageUrl ? (
                                          <img
                                            src={menu.category.imageUrl}
                                            alt={menu.category.name}
                                            className="rounded-circle"
                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                          />
                                        ) : (
                                          <div className="bg-warning bg-opacity-10 rounded-circle p-3" style={{
                                            width: '50px',
                                            height: '50px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                          }}>
                                            <i
                                              className={`bi ${getCategoryIcon(menu.category?.categoryId)} text-warning`}></i>
                                          </div>
                                        )}
                                      </div>
                                      <h6 className="fw-bold text-dark mb-1 small">
                                        {menu.name || menu.category?.name || '메뉴명 없음'}
                                      </h6>
                                      {menu.description && (
                                        <p className="text-muted mb-2 small"
                                           style={{fontSize: '0.75rem', lineHeight: '1.2'}}>
                                          {menu.description}
                                        </p>
                                      )}
                                      {menu.category && (
                                        <div className="d-flex flex-column gap-1">
                                          <span
                                            className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-2 py-1"
                                            style={{fontSize: '0.7rem'}}>
                                            <i className="bi bi-tag me-1"></i>
                                            {menu.category.name}
                                          </span>
                                          {menu.category.classification && (
                                            <span
                                              className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-2 py-1"
                                              style={{fontSize: '0.7rem'}}>
                                              {menu.category.classification.description}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Tab>

            {/* 가게 활동 탭 */}
            <Tab
              eventKey="activity"
              title={
                <span className="d-flex align-items-center gap-2 px-3 py-2">
                  <div className="rounded-circle p-1" style={{background: 'rgba(255, 152, 0, 0.2)'}}>
                    <i className="bi bi-activity" style={{color: '#ff9800'}}></i>
                  </div>
                  <span className="fw-bold" style={{color: '#ff9800'}}>가게 활동</span>
                </span>
              }
            >
              <ActivityHistory
                type="store"
                entityId={store?.storeId}
                initialActiveTab={activitySubTab}
                tabs={[
                  {
                    key: 'reviews',
                    title: '리뷰 목록',
                    icon: 'bi-chat-square-text',
                    component: StoreReviewHistory,
                    spinnerColor: 'text-primary',
                    loadingText: '리뷰 데이터를 불러오는 중...'
                  },
                  {
                    key: 'visits',
                    title: '방문 목록',
                    icon: 'bi-geo-alt',
                    component: StoreVisitHistory,
                    spinnerColor: 'text-warning',
                    loadingText: '방문 이력을 불러오는 중...'
                  },
                  {
                    key: 'images',
                    title: '이미지 목록',
                    icon: 'bi-image',
                    component: StoreImageHistory,
                    spinnerColor: 'text-info',
                    loadingText: '이미지 목록을 불러오는 중...'
                  },
                  {
                    key: 'reports',
                    title: '신고 이력',
                    icon: 'bi-shield-exclamation',
                    component: StoreReportHistory,
                    spinnerColor: 'text-danger',
                    loadingText: '신고 이력을 불러오는 중...'
                  }
                ]}
              />
            </Tab>
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex justify-content-between p-4" style={{
        background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 167, 38, 0.05) 100%)',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px'
      }}>
        <button
          className="btn btn-danger rounded-pill px-4 py-2 shadow-sm"
          onClick={handleDeleteStore}
          disabled={isDeleting}
          style={{
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(220, 53, 69, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              삭제 중...
            </>
          ) : (
            <>
              <i className="bi bi-trash me-2"></i>
              가게 삭제
            </>
          )}
        </button>
        <button
          className="btn btn-secondary rounded-pill px-4 py-2 shadow-sm"
          onClick={handleClose}
          style={{
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
          }}
        >
          <i className="bi bi-x-lg me-2"></i>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default StoreDetailModal;
