import OpenStatusBadge from '../../components/common/badges/OpenStatusBadge';
import StoreLabelBadges from '../../components/common/badges/StoreLabelBadges';
import {Button} from 'react-bootstrap';
import StoreEditForm from '../../components/StoreEditForm';
import SalesTypeBadge from '../../components/common/badges/SalesTypeBadge';
import StoreStatusBadge from '../../components/common/badges/StoreStatusBadge';
import {WRITER_TYPE} from '../../types/common';
import {formatDateTimeKo as formatDateTime} from '../../utils/dateUtils';
import {
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon,
  getLabelBadgeClass,
  getLabelDisplayName,
  getLabelIcon,
  getOpenStatusBadgeClass,
  getOpenStatusDisplayName
} from '../../utils/display/storeDisplay';
import {getWriterTypeBadgeClass} from '../../utils/display/writerDisplay';
import {formatCount, formatRating} from '../../utils/formatUtils';

interface StoreBasicInfoTabProps {
  /** 목록에서 넘어온 요약 정보 (상세 로딩 전 폴백) */
  store: any;
  /** 상세 조회 결과 */
  storeDetail: any;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  onEditSuccess: () => void;
  onReviewClick: () => void;
  onReportClick: () => void;
  onAuthorClick?: (author: any) => void;
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
  const getActivitiesBadge = (activitiesStatus) => {
    return (
      <span
        className={`badge rounded-pill px-3 py-2 ${getActivitiesStatusBadgeClass(activitiesStatus)} bg-opacity-10 text-dark border`}>
        <i className="bi bi-activity me-1"></i>
        {getActivitiesStatusDisplayName(activitiesStatus)}
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
          <i className="bi bi-person-fill text-success" style={{fontSize: '0.9rem'}}></i>
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
          onMouseEnter={(e: any) => {
            if (isClickable) {
              e.currentTarget.style.backgroundColor = 'rgba(13, 110, 253, 0.1)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e: any) => {
            if (isClickable) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <span className="text-muted small">가게 제보자:</span>
          <span
            className={`badge rounded-pill px-3 py-2 ${getWriterTypeBadgeClass(owner.writerType)} bg-opacity-10 ${isClickable ? 'text-primary' : 'text-dark'} border`}>
            <i className="bi bi-shop me-1"></i>
            {owner.name}
          </span>
          {isClickable && (
            <i className="bi bi-box-arrow-up-right text-primary" style={{fontSize: '0.7rem'}}></i>
          )}
        </div>
      </div>
    );
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
          style={{fontSize: '0.75rem', minWidth: '24px'}}
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
      <span key={index} className="badge bg-info me-1 mb-1" style={{fontSize: '0.75rem'}}>
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
                        onError={(e: any) => {
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

  return (
      <div className="p-0">
        {/* 수정 모드: 편집 폼 표시 */}
        {isEditMode ? (
          <div className="bg-white">
            <div className="border-bottom p-3 bg-light d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                <i className="bi bi-pencil-square text-primary"></i>
                가게 정보 수정
              </h6>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setIsEditMode(false)}
              >
                <i className="bi bi-x-lg me-1"></i>
                취소
              </Button>
            </div>
            <StoreEditForm
              storeId={store.storeId.toString()}
              initialName={storeDetail?.name || store.name}
              initialLabels={storeDetail?.labels || store.labels || []}
              onSuccess={onEditSuccess}
              onCancel={() => setIsEditMode(false)}
            />
          </div>
        ) : (
          <div className="container-fluid p-1 p-sm-2 p-md-4">
            {/* 핵심 정보 카드 */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{borderRadius: '12px'}}>
                  <div className="card-body p-2 p-sm-3 p-md-4">
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
                            <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                              <StoreStatusBadge status={storeDetail?.status || store.status} size="lg" withIcon/>
                              {getActivitiesBadge(storeDetail?.activitiesStatus || store.activitiesStatus)}
                              <SalesTypeBadge salesType={storeDetail?.salesType} size="lg" withIcon/>
                              <OpenStatusBadge openStatus={storeDetail?.openStatus}/>
                            </div>
                            {/* 라벨 정보 (별도 줄) */}
                            {(storeDetail?.labels || store.labels) && (storeDetail?.labels || store.labels).length > 0 && (
                              <div className="d-flex align-items-center gap-2 flex-wrap">
                                <StoreLabelBadges labels={storeDetail?.labels || store.labels}/>
                              </div>
                            )}
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
                                onClick={onReviewClick}
                              >
                                <div
                                  className="fw-bold text-primary mb-1">{formatCount(storeDetail.metadata.reviewCount)}</div>
                                <div className="text-muted small">리뷰</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="bg-success bg-opacity-10 rounded-3 p-3 text-center">
                                <div
                                  className="fw-bold text-success mb-1">{formatCount(storeDetail.metadata.subscriberCount)}</div>
                                <div className="text-muted small">구독자</div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div
                                className="bg-danger bg-opacity-10 rounded-3 p-3 text-center position-relative"
                                style={{cursor: 'pointer', transition: 'all 0.2s ease'}}
                                onClick={onReportClick}
                              >
                                <div
                                  className="fw-bold text-danger mb-1">{formatCount(storeDetail.metadata.reportCount)}</div>
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
                  <div className="card-header bg-white border-0 p-2 p-sm-3 p-md-4">
                    <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-info-circle text-primary"></i>
                      상세 정보
                    </h6>
                  </div>
                  <div className="card-body p-2 p-sm-3 p-md-4">
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
                              <p
                                className="mb-0 fw-bold text-dark">{formatOpenStartDateTime(storeDetail.openStatus.openStartDateTime)}</p>
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
                  <div className="card-header bg-white border-0 p-2 p-sm-3 p-md-4">
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
                  <div className="card-body p-2 p-sm-3 p-md-4">
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
                    <div className="card-header bg-white border-0 p-2 p-sm-3 p-md-4">
                      <h6 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
                        <i className="bi bi-menu-button-wide text-warning"></i>
                        메뉴 정보
                        <span className="badge bg-warning ms-auto px-3 py-2 rounded-pill">
                        총 {storeDetail.menus.length}개
                      </span>
                      </h6>
                    </div>
                    <div className="card-body p-2 p-sm-3 p-md-4">
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
        )}
      </div>
  );
};

export default StoreBasicInfoTab;
