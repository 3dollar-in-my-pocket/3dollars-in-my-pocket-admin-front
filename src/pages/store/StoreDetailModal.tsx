import OpenStatusBadge from '@/components/common/badges/OpenStatusBadge';
import StoreLabelBadges from '@/components/common/badges/StoreLabelBadges';
import StoreBasicInfoTab from './StoreBasicInfoTab';
import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import StoreTypeBadge from '@/components/common/badges/StoreTypeBadge';
import DetailModalTabTitle from '@/components/common/DetailModalTabTitle';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Loading from '@/components/common/Loading';
import {useEffect, useState} from 'react';
import {Modal, Tab, Tabs} from 'react-bootstrap';
import {toast} from 'react-toastify';
import storeApi from '@/api/storeApi';
import ActivityHistory from '@/components/ActivityHistory';
import StoreContributorHistory from './detail/StoreContributorHistory';
import StoreCouponHistory from './detail/StoreCouponHistory';
import StoreImageHistory from './detail/StoreImageHistory';
import StoreMarkerHistory from './detail/StoreMarkerHistory';
import StoreMessageHistory from './detail/StoreMessageHistory';
import StorePostHistory from './detail/StorePostHistory';
import StoreReportHistory from './detail/StoreReportHistory';
import StoreReviewHistory from './detail/StoreReviewHistory';
import StoreSettings from './detail/StoreSettings';
import StoreVisitHistory from './detail/StoreVisitHistory';
import {isImagesSupported, isReportsSupported, isVisitsSupported, StoreDetail} from '@/types/store';

interface StoreDetailModalProps {
  show: boolean;
  onHide: () => void;
  /**
   * 목록/이력에서 넘어온 가게 요약 정보 (상세 로딩 전 폴백).
   * 호출부마다 SimpleStore, 마커 조회용 임시 객체 등 형태가 달라 any로 둡니다.
   */
  store: any;
  /** 가게 제보자 클릭 콜백. 호출부에 따라 null/undefined가 전달됩니다. */
  onAuthorClick?: ((author: any) => void) | null;
  /** 가게 삭제 완료 콜백. 호출부에 따라 null/undefined가 전달됩니다. */
  onStoreDeleted?: ((storeId: number) => void) | null;
}

const StoreDetailModal = ({show, onHide, store, onAuthorClick, onStoreDeleted}: StoreDetailModalProps) => {
  const [storeDetail, setStoreDetail] = useState<StoreDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activitySubTab, setActivitySubTab] = useState<string | null>(null);
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

  const handleTabSelect = (tabKey: string | null) => {
    setActiveTab(tabKey);
  };

  // 상세 조회 전에는 목록에서 넘어온 요약 정보를 폴백으로 사용한다
  const storeType = storeDetail?.storeType || store?.storeType;
  const isBossStore = storeType === 'BOSS_STORE';
  const isUserStore = storeType === 'USER_STORE';

  const getFilteredActivityTabs = () => {
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
      className="app-modal detail-modal"
      fullscreen="md-down"
    >
      <Modal.Header closeButton>
        <div className="detail-modal__avatar">
          <i className="bi bi-shop" aria-hidden="true"/>
          {storeType && (
            <span className="detail-modal__avatar-badge">
              <StoreTypeBadge storeType={storeType} size="sm" bordered/>
            </span>
          )}
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="detail-modal__heading">
            <Modal.Title as="h2" className="text-truncate">
              {storeDetail?.name || store.name}
            </Modal.Title>
            <span className="detail-modal__id font-monospace">#{store.storeId}</span>
          </div>
          <div className="detail-modal__meta">
            <StoreStatusBadge status={storeDetail?.status || store.status} withIcon/>
            <OpenStatusBadge openStatus={storeDetail?.openStatus}/>
            <StoreLabelBadges labels={storeDetail?.labels || store.labels}/>
          </div>
          <p className="detail-modal__address">
            <i className="bi bi-geo-alt flex-shrink-0"/>
            <span className="text-truncate">
              {(storeDetail?.address || store.address)?.fullAddress || '주소 정보 없음'}
            </span>
          </p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {isLoading ? (
          <div className="py-5">
            <Loading/>
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchStoreDetail}/>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={handleTabSelect}
            className="border-0"
          >
            {/* 기본 정보 탭 */}
            <Tab
              eventKey="basic"
              title={<DetailModalTabTitle icon="bi-shop" label="기본 정보"/>}
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
              disabled={!isBossStore}
              title={<DetailModalTabTitle icon="bi-gear" label="가게 설정" unsupported={!isBossStore}/>}
            >
              {isBossStore ? (
                <StoreSettings storeId={store?.storeId}/>
              ) : (
                <EmptyState
                  icon="bi-gear"
                  title="가게 설정 기능 미지원"
                  description="이 기능은 사장님 가게에서만 사용할 수 있습니다."
                />
              )}
            </Tab>

            {/* 고객 활동 탭 */}
            <Tab
              eventKey="customer-activity"
              title={<DetailModalTabTitle icon="bi-people" label="고객 활동"/>}
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
              title={<DetailModalTabTitle icon="bi-geo-alt-fill" label="마커 관리"/>}
            >
              <StoreMarkerHistory
                storeId={store?.storeId}
                isActive={activeTab === 'markers'}
              />
            </Tab>

            {/* 가게 기여자들 탭 (유저 제보 가게만) */}
            <Tab
              eventKey="contributors"
              disabled={!isUserStore}
              title={<DetailModalTabTitle icon="bi-people-fill" label="가게 기여자들" unsupported={!isUserStore}/>}
            >
              {isUserStore ? (
                <StoreContributorHistory
                  storeId={store?.storeId}
                  isActive={activeTab === 'contributors'}
                  onAuthorClick={onAuthorClick}
                />
              ) : (
                <EmptyState
                  icon="bi-people-fill"
                  title="가게 기여자 기능 미지원"
                  description="이 기능은 유저 제보 가게에서만 사용할 수 있습니다."
                />
              )}
            </Tab>

            {/* 사장님 활동 탭 */}
            <Tab
              eventKey="owner-activity"
              disabled={!isBossStore}
              title={<DetailModalTabTitle icon="bi-person-badge" label="사장님 활동" unsupported={!isBossStore}/>}
            >
              {isBossStore ? (
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
                <EmptyState
                  icon="bi-person-badge"
                  title="사장님 활동 기능 미지원"
                  description="이 기능은 사장님 가게에서만 사용할 수 있습니다."
                />
              )}
            </Tab>
          </Tabs>
        )}
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <div className="d-flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setIsEditMode(true)}
            disabled={isEditMode}
          >
            <i className="bi bi-pencil me-1"/>
            가게 수정
          </button>

          {/* 유저 제보 가게는 삭제, 사장님 가게는 강제 영업 종료 */}
          {!isBossStore && (
            <button
              className="btn btn-outline-danger"
              onClick={handleDeleteStore}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  삭제 중...
                </>
              ) : (
                <>
                  <i className="bi bi-trash me-1"/>
                  가게 삭제
                </>
              )}
            </button>
          )}

          {isBossStore && (
            <button
              className="btn btn-outline-warning"
              onClick={handleForceCloseStore}
              disabled={isForceClosing}
            >
              {isForceClosing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  종료 중...
                </>
              ) : (
                <>
                  <i className="bi bi-power me-1"/>
                  강제 영업 종료 & 지도 미노출
                </>
              )}
            </button>
          )}
        </div>

        <button className="btn btn-outline-secondary" onClick={handleClose}>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default StoreDetailModal;
