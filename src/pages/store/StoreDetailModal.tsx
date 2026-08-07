import OpenStatusBadge from '../../components/common/badges/OpenStatusBadge';
import StoreLabelBadges from '../../components/common/badges/StoreLabelBadges';
import StoreBasicInfoTab from './StoreBasicInfoTab';
import SalesTypeBadge from '../../components/common/badges/SalesTypeBadge';
import StoreStatusBadge from '../../components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '../../components/common/badges/StoreTypeBadge';
import '../../styles/mobile-tabs.css';
import {useEffect, useState} from 'react';
import {Button, Modal, Tab, Tabs} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeApi from '../../api/storeApi';
import ActivityHistory from '../../components/ActivityHistory';
import StoreContributorHistory from '../../components/StoreContributorHistory';
import StoreCouponHistory from '../../components/StoreCouponHistory';
import StoreEditForm from '../../components/StoreEditForm';
import StoreImageHistory from '../../components/StoreImageHistory';
import StoreMarkerHistory from '../../components/StoreMarkerHistory';
import StoreMessageHistory from '../../components/StoreMessageHistory';
import StorePostHistory from '../../components/StorePostHistory';
import StoreReportHistory from '../../components/StoreReportHistory';
import StoreReviewHistory from '../../components/StoreReviewHistory';
import StoreSettings from '../../components/StoreSettings';
import StoreVisitHistory from '../../components/StoreVisitHistory';
import {WRITER_TYPE} from '../../types/common';
import {StoreDetail, isVisitsSupported, isImagesSupported, isReportsSupported} from '../../types/store';
import {formatDateTimeKo as formatDateTime} from '../../utils/dateUtils';
import {getActivitiesStatusBadgeClass, getActivitiesStatusDisplayName, getCategoryIcon, getLabelBadgeClass, getLabelDisplayName, getLabelIcon, getOpenStatusBadgeClass, getOpenStatusDisplayName, getSalesTypeBadgeClass, getSalesTypeDisplayName, getStoreStatusBadgeClass, getStoreStatusDisplayName, getStoreTypeBadgeClass, getStoreTypeDisplayName, getStoreTypeIcon} from '../../utils/display/storeDisplay';
import {getWriterTypeBadgeClass} from '../../utils/display/writerDisplay';
import {formatCount, formatRating} from '../../utils/formatUtils';

const StoreDetailModal = ({show, onHide, store, onAuthorClick, onStoreDeleted}) => {
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activitySubTab, setActivitySubTab] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isForceClosing, setIsForceClosing] = useState(false);

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
        setError('가게 상세 정보를 불러오는데 실패했습니다.');
        return;
      }

      setStoreDetail(response.data);
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
    setIsEditMode(false);
    setIsForceClosing(false);
    onHide();
  };

  const handleEditSuccess = () => {
    setIsEditMode(false);
    fetchStoreDetail();
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

      if (response.ok) {
        toast.success('가게가 성공적으로 삭제되었습니다.');
        handleClose();
        // 부모 컴포넌트에 삭제 완료를 알려 목록에서 해당 가게를 제거하도록 함
        if (onStoreDeleted) {
          onStoreDeleted(store.storeId);
        }
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForceCloseStore = async () => {
    const confirmed = window.confirm(`정말로 "${store.name}" 가게의 영업을 강제 종료하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);

    if (!confirmed) return;

    setIsForceClosing(true);
    try {
      const response = await storeApi.forceCloseStore(store.storeId);

      if (response.ok) {
        toast.success('가게 영업이 성공적으로 종료되었습니다.');
        // 가게 정보를 다시 불러와서 상태를 업데이트
        fetchStoreDetail();
      }
    } finally {
      setIsForceClosing(false);
    }
  };

  if (!show || !store) return null;

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="xl"
      centered
      className="store-detail-modal"
      style={{maxWidth: '98vw'}}
      dialogClassName="modal-95w"
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
              {(storeDetail?.storeType || store.storeType) && (
                <div className="position-absolute" style={{top: '-8px', right: '-8px'}}>
                  <StoreTypeBadge
                    storeType={storeDetail?.storeType || store.storeType}
                    size="lg"
                    bordered
                  />
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
                <StoreStatusBadge status={storeDetail?.status || store.status} size="lg" withIcon/>
                <OpenStatusBadge openStatus={storeDetail?.openStatus}/>
              </div>
              {/* 라벨 정보 (별도 줄) */}
              {(storeDetail?.labels || store.labels) && (storeDetail?.labels || store.labels).length > 0 && (
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <StoreLabelBadges labels={storeDetail?.labels || store.labels}/>
                </div>
              )}
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
            className="nav-fill border-0 custom-tabs mobile-optimized-tabs"
            style={{
              background: '#f8f9fa',
              borderBottom: '1px solid #e9ecef',
              overflowX: 'auto',
              flexWrap: 'nowrap'
            }}
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-shop" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">기본 정보</span>
                  <span className="fw-medium d-sm-none">기본</span>
                </span>
              }
            >
              <StoreBasicInfoTab
                store={store}
                storeDetail={storeDetail}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                onEditSuccess={handleEditSuccess}
                onReviewClick={handleReviewClick}
                onReportClick={handleReportClick}
                onAuthorClick={onAuthorClick}
              />
            </Tab>

            {/* 가게 설정 탭 */}
            <Tab
              eventKey="settings"
              disabled={(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE')}
              title={
                <span
                  className={`d-flex align-items-center gap-1 gap-md-2 px-1 py-2 ${(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') ? 'text-muted' : ''}`}
                  style={{
                    fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}>
                  <i className="bi bi-gear" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">가게 설정</span>
                  <span className="fw-medium d-sm-none">설정</span>
                  {(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') && (
                    <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{
                      fontSize: '0.6rem',
                      minWidth: '1rem',
                      height: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      X
                    </span>
                  )}
                </span>
              }
            >
              {(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') ? (
                <StoreSettings storeId={store?.storeId}/>
              ) : (
                <div className="p-4">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
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
                <span className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2" style={{
                  fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content'
                }}>
                  <i className="bi bi-people" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">고객 활동</span>
                  <span className="fw-medium d-sm-none">고객</span>
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

            {/* 가게 마커 관리 탭 */}
            <Tab
              eventKey="markers"
              title={
                <span
                  className="d-flex align-items-center gap-1 gap-md-2 px-1 py-2"
                  style={{
                    fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}>
                  <i className="bi bi-geo-alt-fill" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">마커 관리</span>
                  <span className="fw-medium d-sm-none">마커</span>
                </span>
              }
            >
              <StoreMarkerHistory
                storeId={store?.storeId}
                isActive={activeTab === 'markers'}
              />
            </Tab>

            {/* 가게 기여자들 탭 (유저 제보 가게만) */}
            <Tab
              eventKey="contributors"
              disabled={(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE')}
              title={
                <span
                  className={`d-flex align-items-center gap-1 gap-md-2 px-1 py-2 ${(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') ? 'text-muted' : ''}`}
                  style={{
                    fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}>
                  <i className="bi bi-people-fill" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">가게 기여자들</span>
                  <span className="fw-medium d-sm-none">기여자</span>
                  {(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') && (
                    <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{
                      fontSize: '0.6rem',
                      minWidth: '1rem',
                      height: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      X
                    </span>
                  )}
                </span>
              }
            >
              {(storeDetail?.storeType === 'USER_STORE' || store?.storeType === 'USER_STORE') ? (
                <StoreContributorHistory
                  storeId={store?.storeId}
                  isActive={activeTab === 'contributors'}
                  onAuthorClick={onAuthorClick}
                />
              ) : (
                <div className="p-4">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className="bi bi-people-fill fs-1 text-secondary"></i>
                    </div>
                    <h5 className="text-dark mb-2">가게 기여자 기능 미지원</h5>
                    <p className="text-muted mb-3">
                      이 기능은 유저 제보 가게에서만 사용할 수 있습니다.
                    </p>
                    <div className="alert alert-info d-inline-block">
                      <i className="bi bi-info-circle me-2"></i>
                      가게 타입에 따라 지원되는 기능이 다릅니다.
                    </div>
                  </div>
                </div>
              )}
            </Tab>

            {/* 사장님 활동 탭 */}
            <Tab
              eventKey="owner-activity"
              disabled={(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE')}
              title={
                <span
                  className={`d-flex align-items-center gap-1 gap-md-2 px-1 py-2 ${(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') ? 'text-muted' : ''}`}
                  style={{
                    fontSize: window.innerWidth <= 768 ? '0.85rem' : '1rem',
                    whiteSpace: 'nowrap',
                    minWidth: 'fit-content'
                  }}>
                  <i className="bi bi-person-badge" style={{fontSize: '0.9rem'}}></i>
                  <span className="fw-medium d-none d-sm-inline">사장님 활동</span>
                  <span className="fw-medium d-sm-none">사장</span>
                  {(storeDetail?.storeType !== 'BOSS_STORE' && store?.storeType !== 'BOSS_STORE') && (
                    <span className="badge bg-secondary bg-opacity-50 rounded-pill ms-1" style={{
                      fontSize: '0.6rem',
                      minWidth: '1rem',
                      height: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      X
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
                    },
                    {
                      key: 'coupons',
                      title: '쿠폰',
                      icon: 'bi-ticket-perforated',
                      component: StoreCouponHistory,
                      spinnerColor: 'text-warning',
                      loadingText: '쿠폰을 불러오는 중...',
                      isSupported: true
                    }
                  ]}
                />
              ) : (
                <div className="p-4">
                  <div className="text-center py-5">
                    <div className="bg-light rounded-circle mx-auto mb-3" style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
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
        <div className="d-flex gap-2">
          {/* 수정 버튼 */}
          <button
            className="btn btn-primary rounded-pill px-4 py-2 shadow-sm"
            onClick={() => setIsEditMode(true)}
            disabled={isEditMode}
            style={{
              transition: 'all 0.3s ease',
              fontWeight: '600'
            }}
            onMouseEnter={(e: any) => {
              if (!isEditMode) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(13, 110, 253, 0.3)';
              }
            }}
            onMouseLeave={(e: any) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            }}
          >
            <i className="bi bi-pencil me-2"></i>
            가게 수정
          </button>

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
              onMouseEnter={(e: any) => {
                if (!isDeleting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(220, 53, 69, 0.3)';
                }
              }}
              onMouseLeave={(e: any) => {
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

          {/* BOSS_STORE인 경우 강제 영업 종료 버튼 표시 */}
          {(storeDetail?.storeType === 'BOSS_STORE' || store?.storeType === 'BOSS_STORE') && (
            <button
              className="btn btn-warning rounded-pill px-4 py-2 shadow-sm"
              onClick={handleForceCloseStore}
              disabled={isForceClosing}
              style={{
                transition: 'all 0.3s ease',
                fontWeight: '600'
              }}
              onMouseEnter={(e: any) => {
                if (!isForceClosing) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(255, 193, 7, 0.3)';
                }
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              }}
            >
              {isForceClosing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  종료 중...
                </>
              ) : (
                <>
                  <i className="bi bi-power me-2"></i>
                  강제 영업 종료 & 지도 미노출
                </>
              )}
            </button>
          )}
        </div>

        <button
          className="btn btn-secondary rounded-pill px-4 py-2 shadow-sm"
          onClick={handleClose}
          style={{
            transition: 'all 0.3s ease',
            fontWeight: '600'
          }}
          onMouseEnter={(e: any) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.3)';
          }}
          onMouseLeave={(e: any) => {
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
