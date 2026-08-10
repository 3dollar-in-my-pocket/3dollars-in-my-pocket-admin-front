import {Poll} from '@/types/poll';
import {ActivityAuthor} from '@/types/domain';
import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';
import {getWriterTypeDisplayName, getWriterTypeIcon} from '@/utils/display/writerDisplay';
import {
  getPercentage,
  getPollStatus,
  getTimeRemaining,
  getTotalVotes,
  POLL_STATUS_CONFIG
} from '@/utils/display/pollDisplay';

interface PollCardProps {
  poll: Poll;
  onClick?: ((poll: Poll) => void) | null;
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
  onDelete?: ((poll: Poll) => void) | null;
}

const PollCard = ({poll, onClick, onAuthorClick, onDelete}: PollCardProps) => {
  const pollStatus = getPollStatus(poll);
  const statusConfig = POLL_STATUS_CONFIG[pollStatus];
  const totalVotes = getTotalVotes(poll.options);
  const timeRemaining = pollStatus === 'active' ? getTimeRemaining(poll.period.endDateTime) : null;

  /** 상태별 기간 안내 문구 */
  const periodLabel = pollStatus === 'upcoming'
    ? `${formatDateTime(poll.period.startDateTime)} 시작 예정`
    : pollStatus === 'active'
      ? `${formatDateTime(poll.period.endDateTime)} 종료 예정`
      : `${formatDateTime(poll.period.endDateTime)} 종료됨`;

  return (
    <div className="col-12 col-md-6 col-xl-4">
      <div
        className={`item-card h-100 ${onClick ? 'item-card--clickable' : ''} ${pollStatus === 'ended' ? 'item-card--muted' : ''}`}
        onClick={() => onClick?.(poll)}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(poll);
          }
        }}
      >
        <div className="item-card__body">
          {/* 상태 + 카테고리 + 삭제 */}
          <div className="d-flex align-items-start justify-content-between gap-2">
            <div className="d-flex flex-wrap gap-1">
              <span className={`badge ${statusConfig.badgeClass}`}>
                <i className={`bi ${statusConfig.icon} me-1`}/>
                {statusConfig.text}
              </span>
              {timeRemaining && (
                <span className="badge bg-light text-secondary">
                  <i className="bi bi-clock me-1"/>
                  {timeRemaining}
                </span>
              )}
              <span className="form-chip">{poll.category.title}</span>
            </div>
            {onDelete && (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(poll);
                }}
                title="투표 삭제"
                aria-label="투표 삭제"
              >
                <i className="bi bi-trash"/>
              </button>
            )}
          </div>

          {/* 제목 */}
          <h3 className="item-card__name mt-3" title={poll.content.title}>
            {poll.content.title}
          </h3>

          {/* 작성자 */}
          <p className="item-card__desc mb-0">
            {poll.writer ? (
              onAuthorClick ? (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 align-baseline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuthorClick(poll.writer);
                  }}
                >
                  <i className={`bi ${getWriterTypeIcon(poll.writer.writerType)} me-1`}/>
                  {poll.writer.name || `ID: ${poll.writer.writerId}`}
                  <i className="bi bi-box-arrow-up-right ms-1"/>
                </button>
              ) : (
                <span>
                  <i className={`bi ${getWriterTypeIcon(poll.writer.writerType)} me-1`}/>
                  {poll.writer.name || `ID: ${poll.writer.writerId}`}
                </span>
              )
            ) : (
              <span>
                <i className="bi bi-person-x me-1"/>
                익명
              </span>
            )}
            {poll.writer && ` · ${getWriterTypeDisplayName(poll.writer.writerType)}`}
          </p>

          {/* 투표 옵션 */}
          <div className="poll-options">
            {poll.options.map((option) => {
              const percentage = getPercentage(option.ratio);
              return (
                <div key={option.optionId} className="poll-option">
                  <div className="poll-option__head">
                    <span className="poll-option__name" title={option.name}>{option.name}</span>
                    <span className="poll-option__value">
                      {(option.count || 0).toLocaleString()}표
                      <span className="poll-option__pct">{percentage}%</span>
                    </span>
                  </div>
                  <div className="meter">
                    <div className="meter__fill" style={{width: `${percentage}%`}}/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 통계 + 기간 */}
          <div className="form-summary mt-3 pt-2 border-top">
            <div className="form-summary__row">
              <span className="form-summary__label">참여 / 댓글</span>
              <span className="form-summary__value">
                {totalVotes.toLocaleString()}명 / {(poll.metadata?.commentCount || 0).toLocaleString()}개
              </span>
            </div>
            <div className="form-summary__row">
              <span className="form-summary__label">기간</span>
              <span className="form-summary__value form-summary__value--muted">{periodLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;
