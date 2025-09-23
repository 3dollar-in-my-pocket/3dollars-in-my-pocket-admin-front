import {
  formatRating,
  getActivitiesStatusBadgeClass,
  getActivitiesStatusDisplayName,
  getCategoryIcon,
  getStoreStatusBadgeClass,
  getStoreStatusDisplayName,
  getStoreTypeDisplayName,
  getStoreTypeBadgeClass,
  getStoreTypeIcon
} from '../../types/store';
import ItemCard from '../common/ItemCard';

const StoreCard = ({ store, onClick }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getBorderColor = () => {
    const statusClass = getStoreStatusBadgeClass(store.status);
    if (statusClass.includes('success')) return '#198754';
    if (statusClass.includes('warning')) return '#ffc107';
    if (statusClass.includes('danger')) return '#dc3545';
    return '#6c757d';
  };

  const borderColor = getBorderColor();

  return (
    <div className="col-lg-4 col-md-6 col-12">
      <ItemCard
        item={store}
        onClick={onClick}
        borderColor={borderColor}
      >
        <div className="text-center mb-3">
          <div className="rounded-circle p-2 shadow-sm mx-auto mb-2" style={{
            background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}10 100%)`,
            border: `2px solid ${borderColor}40`,
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-shop fs-6" style={{color: borderColor}}></i>
          </div>
        </div>

        <div>
          <div className="text-center mb-2">
            <h6 className="mb-2 fw-bold text-dark" title={store.name} style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{store.name}</h6>

            {/* 상태 정보 섹션 */}
            <div className="d-flex flex-column gap-1 mb-2">
              {/* 가게 상태 */}
              <div className="d-flex justify-content-center">
                <span className={`badge rounded-pill position-relative ${
                  store.status === 'ACTIVE' ? 'bg-success' :
                  store.status === 'DELETED' ? 'bg-danger' :
                  store.status === 'AUTO_DELETED' ? 'bg-warning' : 'bg-secondary'
                } text-white px-3 py-1 small`} style={{fontSize: '0.75rem'}}>
                  <i className={`bi ${
                    store.status === 'ACTIVE' ? 'bi-check-circle-fill' :
                    store.status === 'DELETED' ? 'bi-x-circle-fill' :
                    store.status === 'AUTO_DELETED' ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'
                  } me-1`}></i>
                  {getStoreStatusDisplayName(store.status)}
                  {store.status === 'ACTIVE' && (
                    <div className="position-absolute top-0 start-100 translate-middle">
                      <span className="badge bg-success rounded-circle p-1" style={{fontSize: '0.4rem'}}>
                        <i className="bi bi-circle-fill"></i>
                      </span>
                    </div>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-1 mb-2 flex-wrap">
            <span
              className={`badge rounded-pill ${getActivitiesStatusBadgeClass(store.activitiesStatus)} bg-opacity-10 text-dark border px-2 py-1`}
              style={{fontSize: '0.7rem'}}>
              <i className="bi bi-activity me-1"></i>
              {getActivitiesStatusDisplayName(store.activitiesStatus)}
            </span>
            <span
              className="badge bg-warning bg-opacity-10 text-warning border border-warning rounded-pill px-2 py-1"
              style={{fontSize: '0.7rem'}}>
              <i className="bi bi-star-fill me-1"></i>
              {formatRating(store.rating)}
            </span>
          </div>

          {/* 가게 타입 정보 */}
          {store.storeType && (
            <div className="d-flex justify-content-center mb-2">
              <span className={`badge rounded-pill ${getStoreTypeBadgeClass(store.storeType)} text-white px-3 py-1`}
                    style={{fontSize: '0.75rem', fontWeight: '600'}}>
                <i className={`bi ${getStoreTypeIcon(store.storeType)} me-1`}></i>
                {getStoreTypeDisplayName(store.storeType)}
              </span>
            </div>
          )}

          <div className="mb-2 text-center">
            <div className="text-muted small mb-1" title={store.address?.fullAddress} style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <i className="bi bi-geo-alt me-1"></i>
              {store.address?.fullAddress || '주소 정보 없음'}
            </div>
            <div className="text-muted small">
              <i className="bi bi-calendar3 me-1"></i>
              {formatDateTime(store.createdAt)}
            </div>
          </div>

          {/* 카테고리 미리보기 */}
          <div className="d-flex justify-content-center flex-wrap gap-1 mb-3">
            {store.categories?.slice(0, 2).map((category, idx) => (
              <span key={idx} className="badge rounded-pill px-2 py-1" style={{
                background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
                color: '#667eea',
                border: '1px solid #667eea40',
                fontSize: '0.65rem'
              }}>
                <i className={`bi ${getCategoryIcon(category.categoryId)} me-1`}></i>
                {category?.name}
              </span>
            ))}
            {store.categories && store.categories.length > 2 && (
              <span className="badge bg-light text-muted border rounded-pill px-2 py-1"
                    style={{fontSize: '0.65rem'}}>
                +{store.categories.length - 2}
              </span>
            )}
          </div>

          <div className="text-center">
            <button
              className="btn btn-sm rounded-pill px-3 py-2 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                transition: 'all 0.2s ease',
                fontSize: '0.8rem'
              }}
              onClick={(e) => {
                e.stopPropagation();
                onClick(store);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <i className="bi bi-eye me-1"></i>
              상세보기
            </button>
          </div>
        </div>
      </ItemCard>
    </div>
  );
};

export default StoreCard;