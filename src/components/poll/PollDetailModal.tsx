import {Modal} from 'react-bootstrap';
import DetailField from '@/components/common/DetailField';
import {Poll} from '@/types/poll';
import {ActivityAuthor} from '@/types/domain';
import {formatDateTimeKo as formatDateTime} from '@/utils/dateUtils';
import {getWriterTypeDisplayName, getWriterTypeIcon} from '@/utils/display/writerDisplay';
import {
  getPercentage,
  getPollStatus,
  getTimeRemaining,
  getTotalVotes,
  getWinningOptionId,
  POLL_STATUS_CONFIG
} from '@/utils/display/pollDisplay';

interface PollDetailModalProps {
  show: boolean;
  onHide: () => void;
  poll: Poll | null;
  /** 작성자 클릭 콜백. 없으면 작성자를 링크로 만들지 않습니다. */
  onAuthorClick?: ((author: ActivityAuthor) => void) | null;
  /** 삭제 콜백. 없으면 삭제 버튼을 숨깁니다. */
  onDelete?: ((poll: Poll) => void) | null;
}

/**
 * 투표 상세 모달
 *
 * 투표 단건 조회 API가 없어 목록에서 받은 항목을 그대로 표시합니다.
 */
const PollDetailModal = ({show, onHide, poll, onAuthorClick, onDelete}: PollDetailModalProps) => {
  if (!poll) return null;

  const status = getPollStatus(poll);
  const statusConfig = POLL_STATUS_CONFIG[status];
  const totalVotes = getTotalVotes(poll.options);
  const timeRemaining = status === 'active' ? getTimeRemaining(poll.period.endDateTime) : null;
  const winningOptionId = status === 'upcoming' ? null : getWinningOptionId(poll.options);

  return (
    <Modal show={show} onHide={onHide} centered size="lg" scrollable className="app-modal">
      <Modal.Header closeButton>
        <div className="min-w-0">
          <Modal.Title as="h2">
            <i className="bi bi-bar-chart"/>
            투표 상세
          </Modal.Title>
          <p className="app-modal__subtitle font-monospace">{poll.pollId}</p>
        </div>
      </Modal.Header>

      <Modal.Body>
        {/* 상태 요약 */}
        <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
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

        <h3 className="h6 fw-bold mb-3">{poll.content.title}</h3>

        {/* 투표 결과 */}
        <div className="modal-section">
          <h4 className="modal-section__title">
            <i className="bi bi-list-ol"/>
            투표 결과
            <span className="ms-auto fw-normal text-body-secondary">
              총 {totalVotes.toLocaleString()}표
            </span>
          </h4>

          {poll.options.length === 0 ? (
            <p className="text-body-tertiary small mb-0">등록된 선택지가 없습니다.</p>
          ) : (
            <div className="poll-options">
              {poll.options.map((option) => {
                const percentage = getPercentage(option.ratio);
                const isWinning = option.optionId === winningOptionId;

                return (
                  <div key={option.optionId} className="poll-option">
                    <div className="poll-option__head">
                      <span className="poll-option__name" title={option.name}>
                        {isWinning && <i className="bi bi-trophy-fill text-warning me-1"/>}
                        {option.name}
                      </span>
                      <span className="poll-option__value">
                        {(option.count || 0).toLocaleString()}표
                        <span className="poll-option__pct">{percentage}%</span>
                      </span>
                    </div>
                    <div className="meter">
                      <div
                        className={`meter__fill${isWinning ? ' meter__fill--success' : ''}`}
                        style={{width: `${percentage}%`}}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="modal-section">
          <h4 className="modal-section__title">
            <i className="bi bi-info-circle"/>
            기본 정보
          </h4>
          <div className="row g-3">
            <DetailField label="카테고리" className="col-12 col-md-6">
              {poll.category.title}
            </DetailField>
            <DetailField label="카테고리 ID" className="col-12 col-md-6" monospace>
              {poll.category.categoryId}
            </DetailField>
            <DetailField label="작성자" className="col-12 col-md-6" placeholder="익명">
              {poll.writer ? (
                onAuthorClick ? (
                  <button
                    type="button"
                    className="btn btn-link p-0 align-baseline"
                    onClick={() => onAuthorClick(poll.writer)}
                  >
                    <i className={`bi ${getWriterTypeIcon(poll.writer.writerType)} me-1`}/>
                    {poll.writer.name || `ID: ${poll.writer.writerId}`}
                    <i className="bi bi-box-arrow-up-right ms-1 small"/>
                  </button>
                ) : (
                  <span>
                    <i className={`bi ${getWriterTypeIcon(poll.writer.writerType)} me-1`}/>
                    {poll.writer.name || `ID: ${poll.writer.writerId}`}
                  </span>
                )
              ) : null}
            </DetailField>
            <DetailField label="작성자 유형" className="col-12 col-md-6">
              {poll.writer ? getWriterTypeDisplayName(poll.writer.writerType) : null}
            </DetailField>
            <DetailField label="참여자" className="col-6 col-md-3">
              {totalVotes.toLocaleString()}명
            </DetailField>
            <DetailField label="댓글" className="col-6 col-md-3">
              {(poll.metadata?.commentCount || 0).toLocaleString()}개
            </DetailField>
            <DetailField label="선택지" className="col-6 col-md-3">
              {poll.options.length}개
            </DetailField>
          </div>
        </div>

        {/* 기간 정보 */}
        <div className="modal-section">
          <h4 className="modal-section__title">
            <i className="bi bi-calendar-range"/>
            기간 정보
          </h4>
          <div className="row g-3">
            <DetailField label="시작일시" className="col-12 col-md-6">
              {formatDateTime(poll.period.startDateTime)}
            </DetailField>
            <DetailField label="종료일시" className="col-12 col-md-6">
              {formatDateTime(poll.period.endDateTime)}
            </DetailField>
            <DetailField label="생성일" className="col-12 col-md-6">
              {formatDateTime(poll.createdAt)}
            </DetailField>
            <DetailField label="수정일" className="col-12 col-md-6">
              {formatDateTime(poll.updatedAt)}
            </DetailField>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        {onDelete && (
          <button className="btn btn-outline-danger me-auto" onClick={() => onDelete(poll)}>
            <i className="bi bi-trash me-1"/>
            투표 삭제
          </button>
        )}
        <button className="btn btn-outline-secondary" onClick={onHide}>
          닫기
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PollDetailModal;
