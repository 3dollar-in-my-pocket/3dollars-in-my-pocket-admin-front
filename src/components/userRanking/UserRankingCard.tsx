import {
  getSocialTypeDisplayName,
  getSocialTypeBadgeClass
} from '../../types/user';
import ItemCard from '../common/ItemCard';
import { UserRankingItem } from '../../types/userRanking';

interface UserRankingCardProps {
  rankingItem: UserRankingItem;
  rank: number;
  onClick: (rankingItem: UserRankingItem) => void;
  isSelected?: boolean;
  onToggleSelect?: (userId: number) => void;
}

const UserRankingCard = ({ rankingItem, rank, onClick, isSelected = false, onToggleSelect }: UserRankingCardProps) => {
  const { user, score } = rankingItem;

  const getBorderColor = () => {
    const socialTypeClass = getSocialTypeBadgeClass(user.socialType);
    if (socialTypeClass.includes('warning')) return '#ffc107';
    if (socialTypeClass.includes('danger')) return '#dc3545';
    if (socialTypeClass.includes('dark')) return '#212529';
    return '#6c757d';
  };

  const getRankBadgeColor = () => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#6c757d';
  };

  const borderColor = getBorderColor();
  const rankColor = getRankBadgeColor();

  return (
    <div className="col-lg-3 col-md-4 col-sm-6 col-12 mb-3">
      <ItemCard
        item={rankingItem}
        onClick={() => onClick(rankingItem)}
        borderColor={borderColor}
        style={{
          borderTop: `4px solid ${borderColor}`,
          borderRadius: '12px',
          height: '100%',
          minHeight: '300px',
          position: 'relative',
          backgroundColor: isSelected ? '#e7f3ff' : 'white'
        }}
      >
        {/* 체크박스 */}
        {onToggleSelect && (
          <div className="position-absolute top-0 start-0 m-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(user.userId);
              }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        )}

        {/* 랭킹 배지 */}
        <div className="position-absolute top-0 end-0 m-3">
          <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
               style={{
                 background: rankColor,
                 color: 'white',
                 width: '40px',
                 height: '40px',
                 fontSize: '1rem',
                 boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
               }}>
            {rank}
          </div>
        </div>

        <div className="text-center mb-3 mt-2">
          <div className="rounded-circle p-2 shadow-sm mx-auto mb-2" style={{
            background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}10 100%)`,
            border: `2px solid ${borderColor}40`,
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <i className="bi bi-person fs-4" style={{ color: borderColor }}></i>
          </div>
        </div>

        <div>
          <div className="text-center mb-2">
            <h6 className="mb-1 fw-bold text-dark" title={user.name} style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>{user.name}</h6>
            <span className={`badge rounded-pill ${getSocialTypeBadgeClass(user.socialType)} bg-opacity-10 text-dark border px-2 py-1 small`}>
              {getSocialTypeDisplayName(user.socialType)}
            </span>
          </div>

          <div className="text-center mb-3">
            <div className="row g-1">
              <div className="col-12">
                <div className="text-muted small mb-1 d-flex align-items-center justify-content-center" title={String(user.userId)}>
                  <i className="bi bi-hash me-1"></i>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '120px'
                  }}>
                    {user.userId}
                  </span>
                </div>
              </div>
              <div className="col-12">
                <div className="fw-bold d-flex align-items-center justify-content-center"
                     style={{ color: '#667eea', fontSize: '1.1rem' }}>
                  <i className="bi bi-trophy-fill me-1"></i>
                  {score}점
                </div>
              </div>
              <div className="col-12">
                <div className="text-muted small d-flex align-items-center justify-content-center">
                  <i className="bi bi-calendar3 me-1"></i>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </div>
              </div>
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
                onClick(rankingItem);
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
              onMouseLeave={(e: any) => {
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

export default UserRankingCard;
