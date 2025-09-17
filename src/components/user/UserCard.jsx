import {
  getSocialTypeDisplayName,
  getSocialTypeBadgeClass
} from '../../types/user';
import ItemCard from '../common/ItemCard';

const UserCard = ({ user, onClick }) => {
  const getBorderColor = () => {
    const socialTypeClass = getSocialTypeBadgeClass(user.socialType);
    if (socialTypeClass.includes('warning')) return '#ffc107';
    if (socialTypeClass.includes('danger')) return '#dc3545';
    if (socialTypeClass.includes('dark')) return '#212529';
    return '#6c757d';
  };

  const borderColor = getBorderColor();

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-12">
      <ItemCard
        item={user}
        onClick={onClick}
        borderColor={borderColor}
        style={{
          borderTop: `4px solid ${borderColor}`,
          borderRadius: '12px'
        }}
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
            <i className="bi bi-person fs-6" style={{ color: borderColor }}></i>
          </div>
        </div>

        <div>
          <div className="text-center mb-2">
            <h6 className="mb-1 fw-bold text-dark" title={user.nickname} style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{user.nickname}</h6>
            <span className={`badge rounded-pill ${getSocialTypeBadgeClass(user.socialType)} bg-opacity-10 text-dark border px-2 py-1 small`}>
              {getSocialTypeDisplayName(user.socialType)}
            </span>
          </div>

          <div className="text-center mb-2">
            <div className="text-muted small mb-1" title={user.userId} style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <i className="bi bi-hash me-1"></i>
              {user.userId}
            </div>
            <div className="text-muted small">
              <i className="bi bi-calendar3 me-1"></i>
              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
            </div>
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
                onClick(user);
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

export default UserCard;