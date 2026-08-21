import {getSocialTypeBadgeClass, getSocialTypeDisplayName} from '@/utils/display/userDisplay';
import ItemCard from '@/components/common/ItemCard';
import {UserRankingItem} from '@/types/userRanking';
import {BulkSelectHandler} from '@/types/common';

interface UserRankingCardProps {
  rankingItem: UserRankingItem;
  rank: number;
  onClick: (rankingItem: UserRankingItem) => void;
  isSelected?: boolean;
  onToggleSelect?: BulkSelectHandler<number>;
}

/** 상위 3위는 메달 색으로 구분한다. */
const RANK_MEDAL_CLASS: Record<number, string> = {
  1: 'rank-badge--gold',
  2: 'rank-badge--silver',
  3: 'rank-badge--bronze'
};

const UserRankingCard = ({rankingItem, rank, onClick, isSelected = false, onToggleSelect}: UserRankingCardProps) => {
  const {user, score} = rankingItem;

  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xxl-3">
      <ItemCard
        item={rankingItem}
        onClick={() => onClick(rankingItem)}
        className={`h-100 ${isSelected ? 'item-card--selected' : ''}`}
      >
        <div className="d-flex align-items-start gap-2">
          {onToggleSelect && (
            <input
              className="form-check-input mt-1 flex-shrink-0"
              type="checkbox"
              checked={isSelected}
              onChange={() => {}}
              onClick={(e) => {
                e.stopPropagation();
                // rank는 1-based이므로 배열 인덱스로 변환합니다.
                onToggleSelect(user.userId, rank - 1, e);
              }}
              aria-label={`${user.name} 선택`}
            />
          )}
          <span className={`rank-badge ${RANK_MEDAL_CLASS[rank] || ''}`}>{rank}</span>
          <div className="min-w-0">
            <h3 className="item-card__name text-truncate" title={user.name}>{user.name}</h3>
            <p className="item-card__desc mb-0 font-monospace">#{user.userId}</p>
          </div>
        </div>

        <div className="d-flex align-items-baseline gap-1 mt-3">
          <span className="stat-tile__value">{score.toLocaleString()}</span>
          <span className="stat-tile__label">점</span>
        </div>

        <div className="form-chips">
          <span className={`badge ${getSocialTypeBadgeClass(user.socialType)}`}>
            {getSocialTypeDisplayName(user.socialType)}
          </span>
        </div>

        <p className="item-card__desc mt-auto pt-3 mb-0">
          <i className="bi bi-calendar3 me-1"/>
          {new Date(user.createdAt).toLocaleDateString('ko-KR')} 가입
        </p>
      </ItemCard>
    </div>
  );
};

export default UserRankingCard;
