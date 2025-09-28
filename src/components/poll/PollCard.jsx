import {
  getWriterTypeIcon,
  getWriterTypeTextClass,
  getWriterTypeBgClass,
  getWriterTypeDisplayName
} from '../../types/common';

const PollCard = ({ poll, onClick, onAuthorClick }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getPollStatus = (poll) => {
    const now = new Date();
    const startDate = new Date(poll.period.startDateTime);
    const endDate = new Date(poll.period.endDateTime);

    if (now < startDate) {
      return 'upcoming'; // 예정
    } else if (now >= startDate && now < endDate) {
      return 'active'; // 진행중
    } else {
      return 'ended'; // 종료
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'upcoming':
        return {
          badge: { bg: 'warning', icon: 'bi-clock', text: '시작 예정' },
          border: '#ffc107',
          cardStyle: { opacity: 0.8 }
        };
      case 'active':
        return {
          badge: { bg: 'success', icon: 'bi-play-circle-fill', text: '진행중' },
          border: '#28a745',
          cardStyle: {
            boxShadow: '0 4px 15px rgba(40, 167, 69, 0.2)',
            borderLeft: '4px solid #28a745'
          }
        };
      case 'ended':
        return {
          badge: { bg: 'secondary', icon: 'bi-stop-circle', text: '종료' },
          border: '#6c757d',
          cardStyle: {
            opacity: 0.7,
            filter: 'grayscale(0.3)'
          }
        };
      default:
        return {
          badge: { bg: 'secondary', icon: 'bi-question-circle', text: '알 수 없음' },
          border: '#6c757d',
          cardStyle: {}
        };
    }
  };

  // 총 참여자 수 계산
  const getTotalVotes = (options) => {
    return options.reduce((total, option) => total + (option.count || 0), 0);
  };

  // 비율을 퍼센트로 변환
  const getPercentage = (ratio) => {
    return Math.round((ratio || 0) * 100);
  };


  // 남은 시간 계산
  const getTimeRemaining = (endDateTime) => {
    const now = new Date();
    const end = new Date(endDateTime);
    const diff = end - now;

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}일 남음`;
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분 남음`;
    } else {
      return `${minutes}분 남음`;
    }
  };

  const pollStatus = getPollStatus(poll);
  const statusConfig = getStatusConfig(pollStatus);
  const totalVotes = getTotalVotes(poll.options);
  const timeRemaining = pollStatus === 'active' ? getTimeRemaining(poll.period.endDateTime) : null;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-2 mb-md-3">
      <div
        className="card border-0 shadow-sm h-100 position-relative"
        style={{
          borderRadius: '12px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          borderTop: `4px solid ${statusConfig.border}`,
          ...statusConfig.cardStyle
        }}
        onClick={() => onClick && onClick(poll)}
        onMouseEnter={(e) => {
          if (onClick && pollStatus === 'active') {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(40, 167, 69, 0.3)';
          } else if (onClick) {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = pollStatus === 'active'
              ? '0 4px 15px rgba(40, 167, 69, 0.2)'
              : '0 2px 4px rgba(0,0,0,0.1)';
          }
        }}
      >
        {/* 상태 배지 */}
        <div className="position-absolute" style={{
          top: '8px',
          left: '8px',
          zIndex: 10
        }}>
          {pollStatus === 'active' && timeRemaining ? (
            <div className="d-flex align-items-center gap-2">
              <span
                className="badge text-white d-flex align-items-center gap-1"
                style={{
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  boxShadow: '0 3px 12px rgba(40, 167, 69, 0.4)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '6px 12px',
                  borderRadius: '20px'
                }}
              >
                <i className="bi bi-play-circle-fill" style={{ fontSize: '0.7rem' }}></i>
                <span>진행중</span>
                <div className="vr bg-white opacity-50 mx-1" style={{ width: '1px', height: '12px' }}></div>
                <i className="bi bi-clock" style={{ fontSize: '0.7rem' }}></i>
                <span>{timeRemaining}</span>
              </span>
            </div>
          ) : (
            <span
              className={`badge rounded-pill px-3 py-2 d-flex align-items-center ${
                pollStatus === 'active' ? 'text-white' :
                pollStatus === 'upcoming' ? 'text-dark' :
                'text-white'
              }`}
              style={{
                background: pollStatus === 'active'
                  ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
                  : pollStatus === 'upcoming'
                  ? 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)'
                  : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                boxShadow: `0 3px 12px ${statusConfig.border}40`,
                fontSize: '0.75rem',
                fontWeight: '600',
                position: 'relative'
              }}
            >
              {pollStatus === 'active' && !timeRemaining && (
                <span className="position-absolute top-0 start-0 translate-middle">
                  <span className="animate-ping position-absolute rounded-full bg-white opacity-75" style={{
                    width: '6px',
                    height: '6px'
                  }}></span>
                  <span className="rounded-full bg-white" style={{
                    width: '3px',
                    height: '3px',
                    display: 'block'
                  }}></span>
                </span>
              )}
              <i className={`bi ${statusConfig.badge.icon} me-2`} style={{ fontSize: '0.7rem' }}></i>
              {statusConfig.badge.text}
            </span>
          )}
        </div>

        <div className="card-body" style={{ padding: '16px 12px 12px 12px' }}>
          {/* 작성자 정보 */}
          <div className="mb-2 mb-md-3" style={{ marginTop: '32px' }}>
            <div className="d-flex align-items-start justify-content-between gap-3">
              <div
                className={`d-flex align-items-center gap-2 flex-grow-1 ${poll.writer && onAuthorClick ? 'cursor-pointer' : ''}`}
                style={{
                  cursor: poll.writer && onAuthorClick ? 'pointer' : 'default',
                  borderRadius: '8px',
                  padding: '4px',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={(e) => {
                  if (poll.writer && onAuthorClick) {
                    e.stopPropagation();
                    onAuthorClick(poll.writer);
                  }
                }}
                onMouseEnter={(e) => {
                  if (poll.writer && onAuthorClick) {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (poll.writer && onAuthorClick) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {poll.writer ? (
                  <>
                    <div className={`rounded-circle p-2 ${getWriterTypeBgClass(poll.writer.writerType)}`} style={{ minWidth: '32px', width: '32px', height: '32px' }}>
                      <i className={`bi ${getWriterTypeIcon(poll.writer.writerType)} ${getWriterTypeTextClass(poll.writer.writerType)}`} style={{ fontSize: '0.8rem' }}></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-dark fw-medium" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100px',
                        fontSize: '0.8rem'
                      }}>
                        {poll.writer.name || `ID: ${poll.writer.writerId}`}
                      </span>
                      <span className={`fw-medium ${getWriterTypeTextClass(poll.writer.writerType)}`} style={{ fontSize: '0.7rem' }}>
                        {getWriterTypeDisplayName(poll.writer.writerType)}
                      </span>
                    </div>
                    {onAuthorClick && (
                      <div className="ms-auto">
                        <i className="bi bi-box-arrow-up-right text-primary" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="bg-secondary bg-opacity-10 rounded-circle p-2" style={{ minWidth: '36px' }}>
                      <i className="bi bi-person-x text-muted"></i>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-muted fw-medium" style={{ fontSize: '0.9rem' }}>
                        익명
                      </span>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                        작성자 정보 없음
                      </span>
                    </div>
                  </>
                )}
              </div>
              <span
                className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-2 py-1"
                style={{
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {poll.category.title}
              </span>
            </div>
          </div>

          {/* 투표 제목 */}
          <div className="mb-2 mb-md-3">
            <h6 className="fw-bold text-dark mb-1" style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem'
            }}>
              {poll.content.title}
            </h6>
          </div>

          {/* 투표 옵션과 결과 */}
          <div className="mb-3 mb-md-4">
            <div className="d-flex flex-column gap-1 gap-md-2">
              {poll.options.map((option, index) => {
                const percentage = getPercentage(option.ratio);
                const colorClass = pollStatus === 'ended'
                  ? (index === 0 ? 'secondary' : 'dark')
                  : (index === 0 ? 'primary' : 'danger');
                const bgColor = pollStatus === 'ended'
                  ? (index === 0 ? '#6c757d' : '#343a40')
                  : (index === 0 ? '#007bff' : '#dc3545');

                return (
                  <div key={option.optionId}>
                    <div
                      className="p-2 p-md-3 rounded-3 rounded-md-4 position-relative overflow-hidden"
                      style={{
                        background: pollStatus === 'ended'
                          ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                          : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        border: `2px solid ${bgColor}20`,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* 배경 진행률 */}
                      <div
                        className="position-absolute top-0 start-0 h-100 rounded-4"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}08 100%)`,
                          transition: 'width 0.3s ease',
                          zIndex: 1
                        }}
                      ></div>

                      {/* 옵션 내용 */}
                      <div className="position-relative" style={{ zIndex: 2 }}>
                        <div className="d-flex align-items-center justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-3 flex-grow-1">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: '16px',
                                height: '16px',
                                backgroundColor: bgColor,
                                boxShadow: `0 2px 8px ${bgColor}40`,
                                flexShrink: 0
                              }}
                            >
                              <div
                                className="rounded-circle bg-white"
                                style={{ width: '6px', height: '6px' }}
                              ></div>
                            </div>
                            <span className="fw-semibold text-dark" style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: '0.85rem',
                              flex: 1
                            }}>
                              {option.name}
                            </span>
                          </div>
                          <div className="text-end" style={{ flexShrink: 0 }}>
                            <div className={`fw-bold text-${colorClass} d-flex align-items-center gap-1 justify-content-end`}>
                              <span style={{ fontSize: '0.95rem' }}>{option.count || 0}</span>
                              <span className="text-muted small">표</span>
                            </div>
                            <div className={`fw-medium text-${colorClass}`} style={{ fontSize: '0.75rem' }}>
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 투표 기간 */}
          <div className="mb-3 mb-md-4">
            <div className="d-flex flex-column gap-1 gap-md-2">
              {pollStatus === 'upcoming' && (
                <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                  border: '1px solid #ffc10720'
                }}>
                  <div className="rounded-circle bg-warning bg-opacity-10 p-1">
                    <i className="bi bi-clock text-warning small"></i>
                  </div>
                  <span className="text-warning fw-medium small">
                    {formatDateTime(poll.period.startDateTime)}에 시작 예정
                  </span>
                </div>
              )}
              {pollStatus === 'active' && (
                <>
                  <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{
                    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                    border: '1px solid #28a74520'
                  }}>
                    <div className="rounded-circle bg-success bg-opacity-10 p-1">
                      <i className="bi bi-play-circle-fill text-success small"></i>
                    </div>
                    <span className="text-success fw-medium small">
                      {formatDateTime(poll.period.startDateTime)}에 시작
                    </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between gap-2 p-2 rounded-3" style={{
                    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                    border: '1px solid #dc354520'
                  }}>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-danger bg-opacity-10 p-1">
                        <i className="bi bi-calendar-x text-danger small"></i>
                      </div>
                      <span className="text-danger fw-medium small">
                        {formatDateTime(poll.period.endDateTime)}에 종료 예정
                      </span>
                    </div>
                  </div>
                </>
              )}
              {pollStatus === 'ended' && (
                <div className="d-flex align-items-center gap-2 p-2 rounded-3" style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid #6c757d20'
                }}>
                  <div className="rounded-circle bg-secondary bg-opacity-10 p-1">
                    <i className="bi bi-stop-circle text-muted small"></i>
                  </div>
                  <span className="text-muted fw-medium small">
                    {formatDateTime(poll.period.endDateTime)}에 종료됨
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* 통계 정보 */}
          <div className="border-top pt-2 pt-md-3">
            <div className="row g-2 g-md-3">
              <div className="col-6">
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1 gap-md-2 mb-1">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-1">
                      <i className="bi bi-people text-primary" style={{ fontSize: '0.7rem' }}></i>
                    </div>
                    <span className="text-muted fw-medium" style={{ fontSize: '0.7rem' }}>참여자</span>
                  </div>
                  <div className="fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
                    {totalVotes.toLocaleString()}
                    <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>명</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="text-center">
                  <div className="d-flex align-items-center justify-content-center gap-1 gap-md-2 mb-1">
                    <div className="rounded-circle bg-info bg-opacity-10 p-1">
                      <i className="bi bi-chat-square-text text-info" style={{ fontSize: '0.7rem' }}></i>
                    </div>
                    <span className="text-muted fw-medium" style={{ fontSize: '0.7rem' }}>댓글</span>
                  </div>
                  <div className="fw-bold text-info" style={{ fontSize: '0.95rem' }}>
                    {(poll.metadata?.commentCount || 0).toLocaleString()}
                    <span className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>개</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollCard;