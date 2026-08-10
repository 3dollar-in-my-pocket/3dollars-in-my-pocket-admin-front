import {
  getSocialTypeBadgeClass,
  getSocialTypeDisplayName,
  getUserRoleBadgeClass,
  getUserRoleLabel
} from '@/utils/display/userDisplay';
import ItemCard from '@/components/common/ItemCard';
import {User} from '@/types/user';

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
}

const UserCard = ({user, onClick}: UserCardProps) => (
  <div className="col-12 col-sm-6 col-lg-4 col-xxl-3">
    <ItemCard item={user} onClick={onClick} className="h-100">
      <div className="d-flex align-items-start gap-2">
        <i className="bi bi-person-circle fs-5 text-body-tertiary"/>
        <div className="min-w-0">
          <h3 className="item-card__name text-truncate" title={user.nickname}>
            {user.nickname}
          </h3>
          <p className="item-card__desc mb-0 font-monospace" title={user.userId}>
            #{user.userId}
          </p>
        </div>
      </div>

      <div className="form-chips">
        <span className={`badge ${getSocialTypeBadgeClass(user.socialType)}`}>
          {getSocialTypeDisplayName(user.socialType)}
        </span>
        <span className={`badge ${getUserRoleBadgeClass(user.role)}`}>
          <i className="bi bi-person-gear me-1"/>
          {getUserRoleLabel(user.role)}
        </span>
      </div>

      <p className="item-card__desc mt-auto pt-3 mb-0">
        <i className="bi bi-calendar3 me-1"/>
        {new Date(user.createdAt).toLocaleDateString('ko-KR')} 가입
      </p>
    </ItemCard>
  </div>
);

export default UserCard;
