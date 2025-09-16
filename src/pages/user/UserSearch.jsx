import { useState, useRef, useCallback } from 'react';
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


  // Infinite scroll handler
  const handleScroll = useCallback((e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100;

    if (isScrolledToBottom && hasMore && !isLoading) {
      handleLoadMore();
    }
  }, [hasMore, isLoading]);

  const handleSearch = async (reset = true) => {
    const validationError = validateUserSearch(searchType, searchQuery, userIds);
    if (validationError) {
      toast(validationError);
      return;
    }

    setIsSearching(true);
    setIsLoading(true);

    try {
      const searchRequest = createUserSearchRequest({
        type: searchType,
        query: searchType === SEARCH_TYPES.NAME ? searchQuery : undefined,
        userIds: searchType === SEARCH_TYPES.USER_ID ? formatUserIds(userIds) : undefined,
        cursor: reset ? null : nextCursor,
        size: 30
      });

      const response = await userApi.searchUsers(searchRequest);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(true);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
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
                <option value={SEARCH_TYPES.NAME}>👤 닉네임 검색</option>
                <option value={SEARCH_TYPES.USER_ID}>🏷️ 유저 ID로 검색</option>

              </select>
            </div>

            <div className="col-lg-7 col-md-6">
              <label className="form-label fw-bold text-dark mb-3">
                <i className="bi bi-search me-2 text-success"></i>
                {searchType === SEARCH_TYPES.NAME ? '검색어' : '유저 ID (쉼표로 구분)'}
              </label>
              {searchType === SEARCH_TYPES.NAME ? (
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
                  placeholder="🔍 닉네임을 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <input
                  type="text"
                  className="form-control form-control-lg border-0 shadow-sm"
                  style={{backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px 16px'}}
                  placeholder="🏷️ 1, 2, 3"
                  value={userIds}
                  onChange={handleUserIdInputChange}
                  onKeyDown={handleKeyDown}
                />
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
          style={{ maxHeight: '80vh', overflowY: 'auto' }}
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
            <div className="row g-3 p-3">
              {userList.map((user) => {
                const borderColor = getSocialTypeBadgeClass(user.socialType).includes('warning') ? '#ffc107' :
                  getSocialTypeBadgeClass(user.socialType).includes('danger') ? '#dc3545' :
                  getSocialTypeBadgeClass(user.socialType).includes('dark') ? '#212529' : '#6c757d';

                return (
                  <div key={user.userId} className="col-lg-3 col-md-4 col-sm-6 col-12">
                    <div
                      className="card border-0 shadow-sm h-100"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        borderTop: `4px solid ${borderColor}`,
                        borderRadius: '12px'
                      }}
                      onClick={() => handleUserClick(user)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                      }}
                    >
                      <div className="card-body p-3">
                        <div className="text-center mb-3">
                          <div className="rounded-circle p-2 shadow-sm mx-auto mb-2" style={{
                            background: `linear-gradient(135deg, ${borderColor}20 0%, ${borderColor}10 100%)`,
                            border: `2px solid ${borderColor}40`,
                            width: '50px',
                            height: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <i className="bi bi-person fs-6" style={{ color: borderColor }}></i>
                          </div>
                        </div>

                        <div>
                          <div className="text-center mb-2">
                            <h6 className="mb-1 fw-bold text-dark" title={user.nickname} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>{user.nickname}</h6>
                            <span className={`badge rounded-pill ${getSocialTypeBadgeClass(user.socialType)} bg-opacity-10 text-dark border px-2 py-1 small`}>
                              {getSocialTypeDisplayName(user.socialType)}
                            </span>
                          </div>

                          <div className="text-center mb-2">
                            <div className="text-muted small mb-1" title={user.userId} style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              <i className="bi bi-hash me-1"></i>
                              {user.userId}
                            </div>
                            <div className="text-muted small">
                              <i className="bi bi-calendar3 me-1"></i>
                              {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                            </div>
                          </div>

                          <div className="text-center">
                            <button
                              className="btn btn-sm rounded-pill px-3 py-2 shadow-sm"
                              style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                transition: 'all 0.2s ease',
                                fontSize: '0.8rem'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUserClick(user);
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                              }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              상세보기
                            </button>
                          </div>
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
              <h5 className="text-dark mb-1">검색 중입니다</h5>
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