
const StoreMessageItem = ({ message }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return '없음';
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-start gap-3">
          <div className="bg-success bg-opacity-10 rounded-circle p-2">
            <i className="bi bi-chat-dots text-success"></i>
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2 mb-2">
              <h6 className="mb-0 fw-bold text-dark">가게 메시지</h6>
              <span className="badge bg-success bg-opacity-10 text-success border border-success rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                <i className="bi bi-person-badge me-1"></i>
                사장님
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
              <i className="bi bi-clock"></i>
              <span>{formatDateTime(message.createdAt)}</span>
              {message.updatedAt !== message.createdAt && (
                <>
                  <span>•</span>
                  <span>수정됨</span>
                </>
              )}
            </div>

            {message.body && (
              <div className="bg-light rounded-3 p-3" style={{ borderLeft: '4px solid #198754' }}>
                <p className="text-dark mb-0" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {message.body}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreMessageItem;