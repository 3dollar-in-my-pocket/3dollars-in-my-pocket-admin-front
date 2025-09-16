import { useState, useEffect, useRef, useCallback } from 'react';
import UserDetailModal from './UserDetailModal';
import {
  SEARCH_TYPES,
  createUserSearchRequest,
  getSocialTypeDisplayName,
  getSocialTypeBadgeClass,
  formatUserIds,
  validateUserSearch
} from '../../types/user';
import userApi from '../../api/userApi';
import { toast } from 'react-toastify';

const UserSearch = () => {
  const [searchType, setSearchType] = useState(SEARCH_TYPES.NAME);
  const [searchQuery, setSearchQuery] = useState('');
  const [userIds, setUserIds] = useState('');
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const scrollContainerRef = useRef(null);

  // Auto-load recent users on component mount
  useEffect(() => {
    if (searchType === SEARCH_TYPES.RECENT) {
      handleSearch(true);
    }
  }, [searchType]);

  // Auto-switch to recent users on page load
  useEffect(() => {
    setSearchType(SEARCH_TYPES.RECENT);
  }, []);

  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading]);

  const handleSearch = async (reset = true) => {
    // Skip validation for RECENT search type
    if (searchType !== SEARCH_TYPES.RECENT) {
      const validationError = validateUserSearch(searchType, searchQuery, userIds);
      if (validationError) {
        toast(validationError);
        return;
      }
    }

    setIsSearching(true);
    setIsLoading(true);

    try {
      let response;

      if (searchType === SEARCH_TYPES.RECENT) {
        // Call GET /v1/users for recent users
        response = await userApi.getUsers(
          reset ? null : nextCursor,
          20
        );
      } else {
        // Use existing search API for name and userId search
        const searchRequest = createUserSearchRequest({
          type: searchType,
          query: searchType === SEARCH_TYPES.NAME ? searchQuery : undefined,
          userIds: searchType === SEARCH_TYPES.USER_ID ? formatUserIds(userIds) : undefined,
          cursor: reset ? null : nextCursor,
          size: 20
        });

        response = await userApi.searchUsers(searchRequest);
      }

      if (!response.ok) {
        return
      }

      const { users, hasMore, nextCursor: newNextCursor } = response.data;

      if (reset) {
        setUserList(users);
      } else {
        setUserList(prev => [...prev, ...users]);
      }
      setHasMore(hasMore);
      setNextCursor(newNextCursor);
    } catch (error) {
      toast.error('사용자 정보를 불러오는 중 오류가 발생했습니다.');
      if (reset) {
        setUserList([]);
      }
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleUserIdInputChange = (e) => {
    setUserIds(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(true);
    }
  };

  return (
    <div className="container-xl py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
        <h2 className="fw-bold">👤 유저 검색</h2>
      </div>

      {/* 검색 영역 */}
      <div className="card border-0 shadow-lg mb-5">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-lg-2 col-md-3">
              <label className="form-label fw-bold text-dark mb-3">
                <i className="bi bi-funnel-fill me-2 text-primary"></i>
                검색 방식
              </label>
              <select
                className="form-select form-select-lg border-0 shadow-sm"
                style={{backgroundColor: '#f8f9fa', borderRadius: '12px'}}
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value={SEARCH_TYPES.RECENT}>📅 최신순 조회</option>
                <option value={SEARCH_TYPES.NAME}>👤 닉네임 검색</option>
                <option value={SEARCH_TYPES.USER_ID}>🏷️ 유저 ID로 검색</option>
              </select>
            </div>

            <div className="col-lg-7 col-md-6">
              <label className="form-label fw-bold text-dark mb-3">
                <i className="bi bi-search me-2 text-success"></i>
                {searchType === SEARCH_TYPES.NAME ? '검색어' :
                 searchType === SEARCH_TYPES.USER_ID ? '유저 ID (쉼표로 구분)' : '조회'}
              </label>
              {searchType === SEARCH_TYPES.NAME ? (
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
                  placeholder="🔍 닉네임을 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              ) : searchType === SEARCH_TYPES.USER_ID ? (
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
                  placeholder="🏷️ 1, 2, 3"
                  value={userIds}
                  onChange={handleUserIdInputChange}
                  onKeyPress={handleKeyPress}
                />
              ) : (
                <div className="form-control form-control-lg border-0 shadow-sm d-flex align-items-center"
                     style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px', color: '#6c757d'}}>
                  📅 최신순으로 사용자를 조회합니다
                </div>
              )}
            </div>

            <div className="col-lg-3 col-md-3 d-flex align-items-end">
              <button
                className="btn btn-lg w-100 border-0 shadow-sm"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 20px'
                }}
                onClick={() => handleSearch(true)}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {searchType === SEARCH_TYPES.RECENT ? '조회 중...' : '검색 중...'}
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    {searchType === SEARCH_TYPES.RECENT ? '조회하기' : '검색하기'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 결과 */}
      <div className="card border-0 shadow-lg">
        <div className="card-header bg-white border-0 p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary rounded-circle p-2">
              <i className="bi bi-list-ul text-white"></i>
            </div>
            <h4 className="mb-0 fw-bold text-dark">검색 결과</h4>
          </div>
        </div>
        <div
          className="card-body p-0"
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {userList.length === 0 && !isLoading ? (
            <div className="text-center py-5 text-muted">
              <div className="mb-4">
                <div className="bg-light rounded-circle mx-auto" style={{width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-search fs-1 text-secondary"></i>
                </div>
              </div>
              <h5 className="text-dark mb-2">검색 결과가 없습니다</h5>
              <p className="text-muted">다른 검색어로 시도해보세요.</p>
            </div>
          ) : userList.length > 0 ? (
            <div className="row g-0">
              {userList.map((user, index) => {
                const borderColor = getSocialTypeBadgeClass(user.socialType).includes('warning') ? '#ffc107' :
                  getSocialTypeBadgeClass(user.socialType).includes('danger') ? '#dc3545' :
                  getSocialTypeBadgeClass(user.socialType).includes('dark') ? '#212529' : '#6c757d';

                return (
                  <div key={user.userId} className="col-12">
                    <div
                      className="user-item p-4 border-bottom bg-white"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderLeft: `4px solid ${borderColor}`
                      }}
                      onClick={() => handleUserClick(user)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <h6 className="mb-0 fw-bold text-dark">{user.nickname}</h6>
                              <span className={`badge rounded-pill ${getSocialTypeBadgeClass(user.socialType)} bg-opacity-10 text-dark border`}>
                                {getSocialTypeDisplayName(user.socialType)}
                              </span>
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-hash me-1"></i>
                              ID: {user.userId}
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i>
                              가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>
                        </div>
                        <div className="text-end">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-pill px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUserClick(user);
                            }}
                          >
                            <i className="bi bi-eye me-1"></i>
                            상세보기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* 더 불러올 데이터가 있을 때 로딩 인디케이터 */}
          {hasMore && userList.length > 0 && isLoading && (
            <div className="text-center p-3 bg-light">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="small text-muted mt-2 mb-0">더 많은 사용자를 불러오는 중...</p>
            </div>
          )}

          {/* 로딩 인디케이터 */}
          {isLoading && userList.length === 0 && (
            <div className="text-center py-5">
              <div className="mb-3">
                <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
              <h5 className="text-dark mb-1">{searchType === SEARCH_TYPES.RECENT ? '조회 중입니다' : '검색 중입니다'}</h5>
              <p className="text-muted">잠시만 기다려주세요...</p>
            </div>
          )}
        </div>
      </div>

      {/* 사용자 상세 모달 */}
      <UserDetailModal
        show={!!selectedUser}
        onHide={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
};

export default UserSearch;