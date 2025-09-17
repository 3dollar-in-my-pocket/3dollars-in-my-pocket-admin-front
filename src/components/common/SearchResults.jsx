const SearchResults = ({
  results = [],
  isLoading = false,
  hasMore = false,
  scrollContainerRef,
  onScroll,
  renderItem,
  emptyMessage = "검색 결과가 없습니다",
  emptyDescription = "다른 검색어로 시도해보세요",
  loadingMessage = "검색 중입니다",
  title = "검색 결과"
}) => {
  const renderEmptyState = () => (
    <div className="text-center py-5 text-muted">
      <div className="mb-4">
        <div className="mx-auto mb-4" style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid #667eea30'
        }}>
          <i className="bi bi-search" style={{fontSize: '3rem', color: '#667eea'}}></i>
        </div>
      </div>
      <h5 className="text-dark mb-3 fw-bold">{emptyMessage}</h5>
      <p className="text-muted mb-4">{emptyDescription}</p>
      <div className="d-flex justify-content-center gap-2">
        <span className="badge bg-info bg-opacity-10 text-info border border-info rounded-pill px-3 py-2">
          <i className="bi bi-lightbulb me-1"></i>
          팁: 키워드를 짧게 입력해보세요
        </span>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-5">
      <div className="mb-3">
        <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      <h5 className="text-dark mb-1">{loadingMessage}</h5>
      <p className="text-muted">잠시만 기다려주세요...</p>
    </div>
  );

  const renderLoadMoreIndicator = () => (
    hasMore && results.length > 0 && isLoading && (
      <div className="text-center p-3 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="small text-muted mt-2 mb-0">더 많은 결과를 불러오는 중...</p>
      </div>
    )
  );

  return (
    <div className="card border-0 shadow-lg" style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px'
    }}>
      <div className="card-header border-0 p-4" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px'
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
              <i className="bi bi-grid-3x3-gap text-primary fs-5"></i>
            </div>
            <div>
              <h4 className="mb-0 fw-bold text-dark">{title}</h4>
              {results.length > 0 && (
                <small className="text-muted">총 {results.length}개의 결과가 검색되었습니다</small>
              )}
            </div>
          </div>
          {results.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill px-3 py-2">
                <i className="bi bi-list me-1"></i>
                {results.length}개
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className="card-body p-0"
        ref={scrollContainerRef}
        onScroll={onScroll}
        style={{maxHeight: '80vh', overflowY: 'auto'}}
      >
        {results.length === 0 && !isLoading ? renderEmptyState() :
         results.length > 0 ? (
          <div className="row g-3 p-3">
            {results.map((item, index) => renderItem(item, index))}
          </div>
        ) : null}

        {renderLoadMoreIndicator()}
        {isLoading && results.length === 0 && renderLoadingState()}
      </div>
    </div>
  );
};

export default SearchResults;