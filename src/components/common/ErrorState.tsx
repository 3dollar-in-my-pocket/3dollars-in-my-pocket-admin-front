interface ErrorStateProps {
  /** 표시할 오류 메시지 */
  message: string;
  /** 다시 시도 버튼 클릭 시 동작. 없으면 버튼을 숨깁니다. */
  onRetry?: () => void;
  title?: string;
}

/**
 * 목록 조회 실패 시 표시하는 오류 안내
 *
 * useCursorPagination의 error를 그대로 넘기고, refresh를 onRetry로
 * 연결하면 됩니다.
 */
const ErrorState = ({message, onRetry, title = '오류가 발생했습니다'}: ErrorStateProps) => (
  <div className="text-center py-5">
    <div className="mb-4">
      <div
        className="bg-danger bg-opacity-10 rounded-circle mx-auto"
        style={{
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
      </div>
    </div>
    <h5 className="text-dark mb-2">{title}</h5>
    <p className="text-muted mb-3">{message}</p>
    {onRetry && (
      <button className="btn btn-outline-primary rounded-pill px-4" onClick={onRetry}>
        <i className="bi bi-arrow-clockwise me-2"></i>
        다시 시도
      </button>
    )}
  </div>
);

export default ErrorState;
