
const SearchForm = ({
  searchType,
  setSearchType,
  searchQuery,
  setSearchQuery,
  additionalParams = {},
  setAdditionalParams,
  searchOptions = [],
  onSearch,
  onKeyPress,
  isSearching = false,
  placeholder = "검색어를 입력하세요",
  customInputs = null
}) => {
  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAdditionalParamChange = (key, value) => {
    setAdditionalParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="card border-0 shadow-lg mb-5" style={{
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px'
    }}>
      <div className="card-body p-5">
        <div className="row g-3">
          {/* 검색 방식 선택 */}
          <div className="col-lg-2 col-md-3">
            <label className="form-label fw-bold text-dark mb-3">
              <i className="bi bi-funnel-fill me-2 text-primary"></i>
              검색 방식
            </label>
            <select
              className="form-select form-select-lg border-0 shadow-sm"
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '15px',
                border: '2px solid transparent',
                transition: 'all 0.3s ease'
              }}
              value={searchType}
              onChange={handleSearchTypeChange}
              onFocus={(e) => {
                e.target.style.border = '2px solid #667eea';
                e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.border = '2px solid transparent';
                e.target.style.boxShadow = 'none';
              }}
            >
              {searchOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 검색어 입력 */}
          <div className="col-lg-7 col-md-6">
            <label className="form-label fw-bold text-dark mb-3">
              <i className="bi bi-search me-2 text-success"></i>
              검색어
            </label>
            {customInputs ? (
              customInputs({
                searchType,
                searchQuery,
                handleSearchQueryChange,
                additionalParams,
                handleAdditionalParamChange,
                onKeyPress
              })
            ) : (
              <input
                type="text"
                className="form-control form-control-lg border-0 shadow-sm"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderRadius: '15px',
                  padding: '15px 20px',
                  border: '2px solid transparent',
                  transition: 'all 0.3s ease',
                  fontSize: '16px'
                }}
                placeholder={placeholder}
                value={searchQuery}
                onChange={handleSearchQueryChange}
                onKeyPress={onKeyPress}
                onCompositionEnd={(e: any) => {
                  setSearchQuery(e.target.value);
                }}
                onFocus={(e: any) => {
                  e.target.style.border = '2px solid #667eea';
                  e.target.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.3)';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.border = '2px solid transparent';
                  e.target.style.boxShadow = 'none';
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
              />
            )}
          </div>

          {/* 검색 버튼 */}
          <div className="col-lg-3 col-md-3 d-flex align-items-end">
            <button
              className="btn btn-lg w-100 border-0 shadow-lg position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                color: 'white',
                fontWeight: 'bold',
                padding: '15px 25px',
                transition: 'all 0.3s ease',
                fontSize: '16px'
              }}
              onClick={() => onSearch(true)}
              disabled={isSearching}
              onMouseEnter={(e: any) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e: any) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
              }}
            >
              {isSearching ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  검색 중...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  검색하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;