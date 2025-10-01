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
  getWriterTypeBadgeClass,
  STORE_TYPE,
  isPostsSupported,
  isMessagesSupported,
  isVisitsSupported,
  isImagesSupported,
  isReportsSupported,
  getFeatureUnsupportedMessage
} from '../../types/store';
import { WRITER_TYPE } from '../../types/common';
import storeApi from '../../api/storeApi';
import ActivityHistory from '../../components/ActivityHistory';
import StoreReviewHistory from '../../components/StoreReviewHistory';
import StoreVisitHistory from '../../components/StoreVisitHistory';
import StoreImageHistory from '../../components/StoreImageHistory';
import StoreReportHistory from '../../components/StoreReportHistory';
import StorePostHistory from '../../components/StorePostHistory';
import StoreMessageHistory from '../../components/StoreMessageHistory';
import StoreSettings from '../../components/StoreSettings';
import {toast} from 'react-toastify';

const StoreDetailModal = ({show, onHide, store, onAuthorClick, onStoreDeleted}) => {
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

  const handleTabSelect = (tabKey) => {
    setActiveTab(tabKey);
  };

  const getFilteredActivityTabs = () => {
    const storeType = storeDetail?.storeType || store?.storeType;
    const allTabs = [
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
        loadingText: '방문 이력을 불러오는 중...',
        isSupported: isVisitsSupported(storeType)
      },
      {
        key: 'images',
        title: '이미지 목록',
        icon: 'bi-image',
        component: StoreImageHistory,
        spinnerColor: 'text-info',
        loadingText: '이미지 목록을 불러오는 중...',
        isSupported: isImagesSupported(storeType)
      },
      {
        key: 'reports',
        title: '신고 이력',
        icon: 'bi-shield-exclamation',
        component: StoreReportHistory,
        spinnerColor: 'text-danger',
        loadingText: '신고 이력을 불러오는 중...',
        isSupported: isReportsSupported(storeType)
      }
    ];

    return allTabs;
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
        // 부모 컴포넌트에 삭제 완료를 알려 목록에서 해당 가게를 제거하도록 함
        if (onStoreDeleted) {
          onStoreDeleted(store.storeId);
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
    // USER 타입이 아니거나 정보가 없으면 UI를 표시하지 않음
    if (!owner || !owner.name || owner.writerType !== WRITER_TYPE.USER) {
      return null;
    }

    // USER 타입인 경우에만 클릭 가능
    const isClickable = onAuthorClick;

    return (
      <div className="d-flex align-items-center gap-2">
        <div className="bg-success bg-opacity-10 rounded-circle p-1">
          <i className="bi bi-person-fill text-success" style={{ fontSize: '0.9rem' }}></i>
        </div>
        <div
          className={`d-flex align-items-center gap-1 ${isClickable ? 'clickable-author' : ''}`}
          style={{
            cursor: isClickable ? 'pointer' : 'default',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            backgroundColor: 'transparent'
          }}
          onClick={(e) => {
            if (isClickable) {
              e.stopPropagation();
              onAuthorClick(owner);
            }
          }}
          onMouseEnter={(e) => {
            if (isClickable) {
              e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (isClickable) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span className="text-muted small">가게 제보자:</span>
          <span className={`badge rounded-pill px-3 py-2 ${getWriterTypeBadgeClass(owner.writerType)} bg-opacity-10 ${isClickable ? 'text-primary' : 'text-dark'} border`}>
            <i className="bi bi-shop me-1"></i>
            {owner.name}
          </span>
          {isClickable && (
            <i className="bi bi-box-arrow-up-right text-primary" style={{ fontSize: '0.7rem' }}></i>
          )}
        </div>
      </div>
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

  const formatOpenStartDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDayDisplayName = (day) => {
    const dayMap = {
      'MONDAY': '월',
      'TUESDAY': '화',
      'WEDNESDAY': '수',
      'THURSDAY': '목',
      'FRIDAY': '금',
      'SATURDAY': '토',
      'SUNDAY': '일'
    };
    return dayMap[day] || day;
  };

  const formatAppearanceDays = (days) => {
    if (!days || days.length === 0) return '정보 없음';

    const allDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

    return allDays.map((day, index) => {
      const isActive = days.includes(day);
      return (
        <span
          key={day}
          className={`badge ${isActive ? 'bg-primary' : 'bg-light text-muted'} me-1 mb-1`}
          style={{ fontSize: '0.75rem', minWidth: '24px' }}
        >
          {dayNames[index]}
        </span>
      );
    });
  };

  const getPaymentMethodDisplayName = (method) => {
    const methodMap = {
      'CASH': '현금',
      'CARD': '카드',
      'TRANSFER': '계좌이체',
      'PAY': '간편결제'
    };
    return methodMap[method] || method;
  };

  const formatPaymentMethods = (methods) => {
    if (!methods || methods.length === 0) {
      return <span className="text-muted">결제 방법 정보 없음</span>;
    }

    return methods.map((method, index) => (
      <span key={index} className="badge bg-info me-1 mb-1" style={{ fontSize: '0.75rem' }}>
        {getPaymentMethodDisplayName(method)}
      </span>
    ));
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
        className="border-0 bg-white position-relative"
        style={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="w-100" style={{paddingRight: '40px'}}>
          <div className="d-flex align-items-start gap-3">
            <div className="position-relative">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <i className="bi bi-shop fs-4 text-white"></i>
              </div>
              {getStoreTypeBadge(storeDetail?.storeType || store.storeType) && (
                <div className="position-absolute" style={{top: '-8px', right: '-8px'}}>
                  {getStoreTypeBadge(storeDetail?.storeType || store.storeType)}
                </div>
              )}
            </div>
            <div className="flex-grow-1 min-width-0">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Modal.Title className="mb-0 h4 fw-bold text-dark text-truncate">
                  {storeDetail?.name || store.name}
                </Modal.Title>
                <span className="badge bg-light text-dark border px-2 py-1 small">
                  #{store.storeId}
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                {getStatusBadge(storeDetail?.status || store.status)}
                {getOpenStatusBadge(storeDetail?.openStatus)}
              </div>
              <p className="mb-0 text-muted small d-flex align-items-center">
                <i className="bi bi-geo-alt me-1"></i>
                <span className="text-truncate">
                  {(storeDetail?.address || store.address)?.fullAddress || '주소 정보 없음'}
                </span>
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
            onSelect={handleTabSelect}
            className="nav-fill border-0 custom-tabs"
            style={{
              background: '#f8f9fa',
              borderBottom: '1px solid #e9ecef'
            }}
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={
                <span className="d-flex align-items-center gap-2 px-2 py-2">
                  <i className="bi bi-shop fs-6"></i>
                  <span className="fw-semibold">기본 정보</span>
                </span>
              }
            >
              <div className="p-0">
                <div className="container-fluid p-4">
                  {/* 핵심 정보 카드 */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
                        <div className="card-body p-4">
                          <div className="row align-items-center">
                            <div className="col-lg-8">
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <div
                                  className="rounded-3 d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  }}
                                >
                                  <i className="bi bi-shop fs-5 text-white"></i>
                                </div>
                                <div>
                                  <h5 className="mb-1 fw-bold text-dark">{storeDetail?.name || store.name}</h5>
                                  <div className="d-flex align-items-center gap-2 flex-wrap">
                                    {getStatusBadge(storeDetail?.status || store.status)}
                                    {getActivitiesBadge(storeDetail?.activitiesStatus || store.activitiesStatus)}
                                    {getSalesTypeBadge(storeDetail?.salesType)}
                                    {getOpenStatusBadge(storeDetail?.openStatus)}
                                  </div>
                                </div>
                              </div>
                              {storeDetail?.owner && (
                                <div className="mb-3">
                                  {getOwnerBadge(storeDetail.owner)}
                                </div>
                              )}
                            </div>
                            {storeDetail?.metadata && (
                              <div className="col-lg-4">
                                <div className="row g-2">
                                  <div className="col-4">
                                    <div
                                      className="bg-primary bg-opacity-10 rounded-3 p-3 text-center position-relative"
                                      style={{cursor: 'pointer', transition: 'all 0.2s ease'}}
                                      onClick={handleReviewClick}
                                    >
                                      <div className="fw-bold text-primary mb-1">{formatCount(storeDetail.metadata.reviewCount)}</div>
                                      <div className="text-muted small">리뷰</div>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                      <div className="fw-bold text-success mb-1">{formatCount(storeDetail.metadata.subscriberCount)}</div>
                                      <div className="text-muted small">구독자</div>
                                    </div>
                                  </div>
                                  <div className="col-4">
                                    <div
                                      className="bg-danger bg-opacity-10 rounded-3 p-3 text-center position-relative"
                                      style={{cursor: 'pointer', transition: 'all 0.2s ease'}}
                                      onClick={handleReportClick}
                                    >
                                      <div className="fw-bold text-danger mb-1">{formatCount(storeDetail.metadata.reportCount)}</div>
                                      <div className="text-muted small">신고</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상세 정보 섹션 */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
                        <div className="card-header bg-white border-0 p-4">
                          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-info-circle text-primary"></i>
                            상세 정보
                          </h6>
                        </div>
                        <div className="card-body p-4">
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

                          {storeDetail?.openStatus?.openStartDateTime && (
                            <div className="col-md-6">
                              <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-2">
                                  <i className="bi bi-clock text-success"></i>
                                </div>
                                <div>
                                  <label className="form-label fw-semibold text-muted mb-1">영업 시작</label>
                                  <p className="mb-0 fw-bold text-dark">{formatOpenStartDateTime(storeDetail.openStatus.openStartDateTime)}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="col-12">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-calendar-week text-primary"></i>
                              </div>
                              <div className="flex-grow-1">
                                <label className="form-label fw-semibold text-muted mb-1">영업 요일</label>
                                <div className="d-flex flex-wrap gap-1">
                                  {formatAppearanceDays(storeDetail?.appearanceDays || store.appearanceDays)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2">
                                <i className="bi bi-credit-card text-info"></i>
                              </div>
                              <div className="flex-grow-1">
                                <label className="form-label fw-semibold text-muted mb-1">결제 방법</label>
                                <div className="d-flex flex-wrap gap-1">
                                  {formatPaymentMethods(storeDetail?.paymentMethods || store.paymentMethods)}
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 카테고리 정보 섹션 */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
                        <div className="card-header bg-white border-0 p-4">
                          <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                            <i className="bi bi-tags text-info"></i>
                            카테고리 정보
                            {store.categories && store.categories.length > 0 && (
                              <span className="badge bg-info ms-auto px-3 py-2 rounded-pill">
                                총 {store.categories.length}개
                              </span>
                            )}
                          </h6>
                        </div>
                        <div className="card-body p-4">
                          {getCategoryList(storeDetail?.categories || store.categories)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 메뉴 정보 섹션 */}
                  {storeDetail?.menus && storeDetail.menus.length > 0 && (
                    <div className="row mb-4">
                      <div className="col-12">
                        <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
                          <div className="card-header bg-white border-0 p-4">
                            <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                              <i className="bi bi-menu-button-wide text-warning"></i>
                              메뉴 정보
                              <span className="badge bg-warning ms-auto px-3 py-2 rounded-pill">
                                총 {storeDetail.menus.length}개
                              </span>
                            </h6>
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
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tab>

            {/* 가게 설정 탭 */}
            <Tab
              eventKey="settings"
              disabled={(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE')}
              title={
                <span className={`d-flex align-items-center gap-2 px-2 py-2 ${(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') ? 'text-muted' : ''}`}>
                  <i className="bi bi-gear fs-6"></i>
                  <span className="fw-semibold">가게 설정</span>
                  {(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') && (
                    <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                      미지원
                    </span>
                  )}
                </span>
              }
            >
              {(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') ? (
                <StoreSettings storeId={store?.storeId} />
              ) : (
                <div className="p-4">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-gear fs-1 text-secondary"></i>
                    </div>
                    <h5 className="text-dark mb-2">가게 설정 기능 미지원</h5>
                    <p className="text-muted mb-3">
                      이 기능은 사장님 가게에서만 사용할 수 있습니다.
                    </p>
                    <div className="alert alert-info d-inline-block">
                      <i className="bi bi-info-circle me-2"></i>
                      가게 타입에 따라 지원되는 기능이 다릅니다.
                    </div>
                  </div>
                </div>
              )}
            </Tab>

            {/* 고객 활동 탭 */}
            <Tab
              eventKey="customer-activity"
              title={
                <span className="d-flex align-items-center gap-2 px-2 py-2">
                  <i className="bi bi-people fs-6"></i>
                  <span className="fw-semibold">고객 활동</span>
                </span>
              }
            >
              <ActivityHistory
                type="store"
                entityId={store?.storeId}
                initialActiveTab={activitySubTab}
                onAuthorClick={onAuthorClick}
                tabs={getFilteredActivityTabs()}
              />
            </Tab>

            {/* 사장님 활동 탭 */}
            <Tab
              eventKey="owner-activity"
              disabled={(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE')}
              title={
                <span className={`d-flex align-items-center gap-2 px-2 py-2 ${(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') ? 'text-muted' : ''}`}>
                  <i className="bi bi-person-badge fs-6"></i>
                  <span className="fw-semibold">사장님 활동</span>
                  {(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') && (
                    <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{ fontSize: '0.6rem' }}>
                      미지원
                    </span>
                  )}
                </span>
              }
            >
              {(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') ? (
                <ActivityHistory
                  type="store"
                  entityId={store?.storeId}
                  initialActiveTab={null}
                  onAuthorClick={onAuthorClick}
                  tabs={[
                    {
                      key: 'posts',
                      title: '가게 소식',
                      icon: 'bi-newspaper',
                      component: StorePostHistory,
                      spinnerColor: 'text-info',
                      loadingText: '소식을 불러오는 중...',
                      isSupported: true
                    },
                    {
                      key: 'messages',
                      title: '가게 메시지',
                      icon: 'bi-chat-dots',
                      component: StoreMessageHistory,
                      spinnerColor: 'text-success',
                      loadingText: '메시지를 불러오는 중...',
                      isSupported: true
                    }
                  ]}
                />
              ) : (
                <div className="p-4">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <i className="bi bi-person-badge fs-1 text-secondary"></i>
                    </div>
                    <h5 className="text-dark mb-2">사장님 활동 기능 미지원</h5>
                    <p className="text-muted mb-3">
                      이 기능은 사장님 가게에서만 사용할 수 있습니다.
                    </p>
                    <div className="alert alert-info d-inline-block">
                      <i className="bi bi-info-circle me-2"></i>
                      가게 타입에 따라 지원되는 기능이 다릅니다.
                    </div>
                  </div>
                </div>
              )}
            </Tab>
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex justify-content-between p-4 bg-white" style={{
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        boxShadow: '0 -1px 3px rgba(0,0,0,0.1)'
      }}>
        {/* BOSS_STORE가 아닌 경우에만 삭제 버튼 표시 */}
        {(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') && (
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
        )}
        <button
          className={`btn btn-secondary rounded-pill px-4 py-2 shadow-sm ${
            (storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') ? 'ms-auto' : ''
          }`}
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
