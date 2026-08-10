import OpenStatusBadge from '@/components/common/badges/OpenStatusBadge';
import StoreLabelBadges from '@/components/common/badges/StoreLabelBadges';
import StoreEditForm from './detail/StoreEditForm';
import SalesTypeBadge from '@/components/common/badges/SalesTypeBadge';
import StoreStatusBadge from '@/components/common/badges/StoreStatusBadge';
import DetailField from '@/components/common/DetailField';
import EmptyState from '@/components/common/EmptyState';
import {WRITER_TYPE} from '@/types/common';
import {ActivitiesStatus, StoreDetail, StoreFoodCategory} from '@/types/store';
import {Writer} from '@/types/domain';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon
} from '@/utils/display/storeDisplay';
import {getWriterTypeBadgeClass} from '@/utils/display/writerDisplay';
import {formatCount, formatRating} from '@/utils/formatUtils';

interface StoreBasicInfoTabProps {
  /** 목록에서 넘어온 요약 정보 (상세 로딩 전 폴백) */
  store: any;
  /** 상세 조회 결과 */
  storeDetail: StoreDetail | null;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  onEditSuccess: () => void;
  onReviewClick: () => void;
  onReportClick: () => void;
  /** 호출부에 따라 null/undefined가 전달될 수 있습니다. */
  onAuthorClick?: ((author: Writer) => void) | null;
}

/**
 * 가게 상세 모달의 기본 정보 탭
 */
const StoreBasicInfoTab = ({
                             store,
                             storeDetail,
                             isEditMode,
                             setIsEditMode,
                             onEditSuccess,
                             onReviewClick,
                             onReportClick,
                             onAuthorClick
                           }: StoreBasicInfoTabProps) => {
  const getActivitiesBadge = (activitiesStatus: ActivitiesStatus) => {
    return (
      <span className={`badge ${getActivitiesStatusBadgeClass(activitiesStatus)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-activity me-1"/>
        {getActivitiesStatusDisplayName(activitiesStatus)}
      </span>
    );
  };

  /** 가게 제보자 (USER 타입만 노출, 콜백이 있으면 클릭 가능) */
  const getOwnerBadge = (owner?: Writer) => {
    // USER 타입이 아니거나 정보가 없으면 UI를 표시하지 않음
    if (!owner || !owner.name || owner.writerType !== WRITER_TYPE.USER) {
      return null;
    }

    // USER 타입인 경우에만 클릭 가능
    const isClickable = !!onAuthorClick;

    if (!isClickable) {
      return (
        <span className={`badge ${getWriterTypeBadgeClass(owner.writerType)} bg-opacity-10 text-dark border`}>
          <i className="bi bi-shop me-1"/>
          {owner.name}
        </span>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-link btn-sm p-0 text-decoration-none clickable-author"
        onClick={(e) => {
          e.stopPropagation();
          onAuthorClick(owner);
        }}
      >
        <i className="bi bi-shop me-1"/>
        {owner.name}
        <i className="bi bi-box-arrow-up-right ms-1 small"/>
      </button>
    );
  };

  const formatOpenStartDateTime = (dateString?: string) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAppearanceDays = (days?: string[]) => {
    if (!days || days.length === 0) return <span className="text-body-tertiary">정보 없음</span>;

    const allDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

    return (
      <div className="d-flex flex-wrap gap-1">
        {allDays.map((day, index) => {
          const isActive = days.includes(day);
          return (
            <span
              key={day}
              className={`badge ${isActive ? 'bg-primary-subtle text-primary-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}
            >
              {dayNames[index]}
            </span>
          );
        })}
      </div>
    );
  };

  const getPaymentMethodDisplayName = (method: string) => {
    const methodMap: Record<string, string> = {
      'CASH': '현금',
      'CARD': '카드',
      'TRANSFER': '계좌이체',
      'PAY': '간편결제'
    };
    return methodMap[method] || method;
  };

  const formatPaymentMethods = (methods?: string[]) => {
    if (!methods || methods.length === 0) {
      return <span className="text-body-tertiary">결제 방법 정보 없음</span>;
    }

    return (
      <div className="d-flex flex-wrap gap-1">
        {methods.map((method, index) => (
          <span key={index} className="badge bg-info-subtle text-info-emphasis">
            {getPaymentMethodDisplayName(method)}
          </span>
        ))}
      </div>
    );
  };

  const getCategoryList = (categories?: StoreFoodCategory[]) => {
    if (!categories || categories.length === 0) {
      return (
        <EmptyState
          icon="bi-tags"
          title="카테고리 정보가 없습니다"
          description="등록된 카테고리가 없습니다."
        />
      );
    }

    return (
      <div className="row g-2">
        {categories.map((category, index) => (
          <div key={category.categoryId || index} className="col-6 col-md-4 col-xl-3">
            <div className="medal-tile">
              {category.imageUrl ? (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="medal-tile__icon"
                  onError={(e: any) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span
                className="medal-tile__figure align-items-center justify-content-center"
                style={{display: category.imageUrl ? 'none' : 'flex'}}
              >
                <i className={`bi ${getCategoryIcon(category.categoryId)} fs-4 text-primary`}/>
              </span>
              <span className="medal-tile__name">{category.name}</span>
              {category.description && (
                <span className="medal-tile__desc">{category.description}</span>
              )}
              {category.classification && (
                <span className="badge bg-info-subtle text-info-emphasis">
                  <i className="bi bi-tag me-1"/>
                  {category.classification.description}
                </span>
              )}
              {category.isNew && (
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  <i className="bi bi-sparkles me-1"/>
                  NEW
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 수정 모드: 편집 폼 표시
  if (isEditMode) {
    return (
      <div className="history-panel">
        <div className="history-panel__head">
          <h3 className="history-panel__title">
            <i className="bi bi-pencil-square"/>
            가게 정보 수정
          </h3>
          <div className="history-panel__aside">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setIsEditMode(false)}
            >
              <i className="bi bi-x-lg me-1"/>
              취소
            </button>
          </div>
        </div>
        <StoreEditForm
          storeId={store.storeId.toString()}
          initialName={storeDetail?.name || store.name}
          initialLabels={storeDetail?.labels || store.labels || []}
          onSuccess={onEditSuccess}
          onCancel={() => setIsEditMode(false)}
        />
      </div>
    );
  }

  const labels = storeDetail?.labels || store.labels;
  const categories = storeDetail?.categories || store.categories;
  const ownerBadge = getOwnerBadge(storeDetail?.owner);

  return (
    <div className="history-panel">
      {/* 가게 개요 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-shop"/>
          가게 개요
        </h3>
        <h4 className="item-card__name fs-6 mb-2">{storeDetail?.name || store.name}</h4>
        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
          <StoreStatusBadge status={storeDetail?.status || store.status} size="lg" withIcon/>
          {getActivitiesBadge(storeDetail?.activitiesStatus || store.activitiesStatus)}
          <SalesTypeBadge salesType={storeDetail?.salesType} size="lg" withIcon/>
          <OpenStatusBadge openStatus={storeDetail?.openStatus}/>
        </div>
        {/* 라벨 정보 (별도 줄) */}
        {labels && labels.length > 0 && (
          <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
            <StoreLabelBadges labels={labels}/>
          </div>
        )}
        {ownerBadge && (
          <div className="row g-3 mt-1">
            <DetailField label="가게 제보자" className="col-12">
              {ownerBadge}
            </DetailField>
          </div>
        )}

        {storeDetail?.metadata && (
          <div className="row g-2 mt-2">
            <div className="col-4">
              <button
                type="button"
                className="stat-tile w-100 text-start"
                onClick={onReviewClick}
              >
                <span className="stat-tile__label">리뷰</span>
                <span className="stat-tile__value text-primary">
                  {formatCount(storeDetail.metadata.reviewCount)}
                </span>
              </button>
            </div>
            <div className="col-4">
              <div className="stat-tile">
                <span className="stat-tile__label">구독자</span>
                <span className="stat-tile__value text-success">
                  {formatCount(storeDetail.metadata.subscriberCount)}
                </span>
              </div>
            </div>
            <div className="col-4">
              <button
                type="button"
                className="stat-tile w-100 text-start"
                onClick={onReportClick}
              >
                <span className="stat-tile__label">신고</span>
                <span className="stat-tile__value text-danger">
                  {formatCount(storeDetail.metadata.reportCount)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-info-circle"/>
          상세 정보
        </h3>
        <div className="row g-3">
          <DetailField label="가게 ID" className="col-6 col-md-4" monospace>
            {storeDetail?.storeId || store.storeId}
          </DetailField>
          <DetailField label="평균 평점" className="col-6 col-md-4">
            <span className="rating-badge">
              <i className="bi bi-star-fill"/>
              {formatRating(storeDetail?.rating || store.rating)}
            </span>
          </DetailField>
          {storeDetail?.openStatus?.openStartDateTime && (
            <DetailField label="영업 시작" className="col-12 col-md-4">
              {formatOpenStartDateTime(storeDetail.openStatus.openStartDateTime)}
            </DetailField>
          )}
          <DetailField label="주소" className="col-12">
            {(storeDetail?.address || store.address)?.fullAddress || '주소 정보 없음'}
          </DetailField>
          <DetailField label="생성일" className="col-12 col-md-6">
            {formatDateTime(storeDetail?.createdAt || store.createdAt)}
          </DetailField>
          <DetailField label="마지막 수정일" className="col-12 col-md-6">
            {formatDateTime(storeDetail?.updatedAt || store.updatedAt)}
          </DetailField>
          <DetailField label="영업 요일" className="col-12">
            {formatAppearanceDays(storeDetail?.appearanceDays || store.appearanceDays)}
          </DetailField>
          <DetailField label="결제 방법" className="col-12">
            {formatPaymentMethods(storeDetail?.paymentMethods || store.paymentMethods)}
          </DetailField>
        </div>
      </div>

      {/* 카테고리 정보 */}
      <div className="modal-section">
        <h3 className="modal-section__title">
          <i className="bi bi-tags"/>
          카테고리 정보
          {categories && categories.length > 0 && (
            <span className="history-panel__count">총 {categories.length}개</span>
          )}
        </h3>
        {getCategoryList(categories)}
      </div>

      {/* 메뉴 정보 */}
      {storeDetail?.menus && storeDetail.menus.length > 0 && (
        <div className="modal-section">
          <h3 className="modal-section__title">
            <i className="bi bi-menu-button-wide"/>
            메뉴 정보
            <span className="history-panel__count">총 {storeDetail.menus.length}개</span>
          </h3>
          <div className="row g-2">
            {storeDetail.menus.map((menu, index) => (
              <div key={index} className="col-6 col-md-4 col-xl-3">
                <div className="medal-tile">
                  {menu.category?.imageUrl ? (
                    <img
                      src={menu.category.imageUrl}
                      alt={menu.category.name}
                      className="medal-tile__icon"
                    />
                  ) : (
                    <span className="medal-tile__figure align-items-center justify-content-center">
                      <i className={`bi ${getCategoryIcon(menu.category?.categoryId)} fs-4 text-warning`}/>
                    </span>
                  )}
                  <span className="medal-tile__name">
                    {menu.name || menu.category?.name || '메뉴명 없음'}
                  </span>
                  {menu.description && (
                    <span className="medal-tile__desc">{menu.description}</span>
                  )}
                  {menu.category && (
                    <>
                      <span className="badge bg-warning-subtle text-warning-emphasis">
                        <i className="bi bi-tag me-1"/>
                        {menu.category.name}
                      </span>
                      {menu.category.classification && (
                        <span className="badge bg-info-subtle text-info-emphasis">
                          {menu.category.classification.description}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreBasicInfoTab;
