import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import pollApi from '../../api/pollApi';
import SearchHeader from '../../components/common/SearchHeader';
import PollCard from '../../components/poll/PollCard';
import UserDetailModal from '../user/UserDetailModal';

const PollManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const cursorRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await pollApi.getPollCategories();
        if (response.ok) {
          setCategories(response.data.contents);
          // 첫 번째 카테고리를 기본 선택
          if (response.data.contents.length > 0) {
            setSelectedCategory(response.data.contents[0].categoryId);
          }
        }
      } catch (error) {
        console.error('카테고리 조회 실패:', error);
        toast.error('카테고리를 불러오는데 실패했습니다.');
      }
    };

    fetchCategories();
  }, []);

  // 투표 목록 조회
  const fetchPolls = useCallback(async (category, isLoadMore = false) => {
    if (!category) return;

    const currentCursor = isLoadMore ? cursorRef.current : null;

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setPolls([]);
      cursorRef.current = null;
      setHasMore(false);
    }

    try {
      const response = await pollApi.getPolls(
        category,
        30,
        currentCursor
      );

      if (response.ok) {
        const newPolls = response.data.contents;

        if (isLoadMore) {
          setPolls(prev => [...prev, ...newPolls]);
        } else {
          setPolls(newPolls);
        }

        // 서버에서 제공하는 hasMore와 nextCursor 값 사용
        setHasMore(response.data.cursor.hasMore);

        // 서버에서 제공하는 nextCursor 값을 그대로 사용
        if (response.data.cursor.hasMore && response.data.cursor.nextCursor) {
          cursorRef.current = response.data.cursor.nextCursor;
        } else {
          cursorRef.current = null;
        }
      }
    } catch (error) {
      console.error('투표 목록 조회 실패:', error);
      const errorMessage = isLoadMore
        ? '추가 투표를 불러오는데 실패했습니다.'
        : '투표 목록을 불러오는데 실패했습니다.';
      toast.error(errorMessage);

      // 더보기 실패 시 hasMore 상태 유지하여 재시도 가능하도록 함
      if (!isLoadMore) {
        setPolls([]);
        setHasMore(false);
        cursorRef.current = null;
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // 카테고리 변경 시 투표 목록 새로 조회
  useEffect(() => {
    if (selectedCategory) {
      fetchPolls(selectedCategory);
    }
  }, [selectedCategory]);

  // 무한 스크롤 처리 (디바운싱 추가)
  const lastScrollTime = useRef(0);
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore || !cursorRef.current) return;

    const now = Date.now();
    // 300ms 디바운싱으로 중복 호출 방지
    if (now - lastScrollTime.current < 300) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // 하단에서 100px 전에 로딩 시작

    // 스크롤이 하단 근처에 도달했을 때만 더보기 실행
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      lastScrollTime.current = now;
      fetchPolls(selectedCategory, true);
    }
  }, [selectedCategory, isLoadingMore, hasMore, fetchPolls]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 투표 상세보기 (일단 로그만 출력)
  const handlePollClick = (poll) => {
  };

  // 작성자 클릭 핸들러
  const handleAuthorClick = (writer) => {
    if (writer && writer.writerId) {
      // 유저 검색에서 사용하는 user 객체 형태로 변환
      const userForModal = {
        userId: writer.writerId,
        nickname: writer.name || `ID: ${writer.writerId}`
      };
      setSelectedUser(userForModal);
    }
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  // 투표 삭제 핸들러
  const handleDeletePoll = async (poll) => {
    const confirmed = window.confirm(
      `정말로 "${poll.content.title}" 투표를 삭제하시겠습니까?\n\n` +
      `투표 기간: ${formatDateTime(poll.period.startDateTime)} ~ ${formatDateTime(poll.period.endDateTime)}\n` +
      `현재 참여자: ${getTotalVotes(poll.options)}명\n\n` +
      `이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    try {
      const response = await pollApi.deletePoll(poll.pollId);

      if (response.status === 200 || response.status === 204) {
        toast.success('투표가 성공적으로 삭제되었습니다.');
        // 현재 카테고리의 투표 목록을 새로 조회
        fetchPolls(selectedCategory);
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('투표 삭제 실패:', error);
      const errorMessage = error.response?.status === 404
        ? '투표를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.'
        : error.response?.status === 403
        ? '투표 삭제 권한이 없습니다.'
        : '투표 삭제 중 오류가 발생했습니다.';
      toast.error(errorMessage);
    }
  };

  // 투표 총 참여자 수 계산 (확인 메시지용)
  const getTotalVotes = (options) => {
    return options.reduce((total, option) => total + (option.count || 0), 0);
  };

  // 날짜 포맷팅 (확인 메시지용)
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

  return (
    <div className="container-fluid px-2 px-md-4 py-3 py-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold fs-3 fs-md-2">투표 관리</h2>
      </div>

      {/* 카테고리 선택 */}
      <div className="card border-0 shadow-sm mb-3 mb-md-4">
        <div className="card-header bg-light border-0 p-3 p-md-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2">
              <i className="bi bi-grid-3x3-gap text-primary"></i>
            </div>
            <h5 className="mb-0 fw-bold text-dark fs-6 fs-md-5">카테고리 선택</h5>
          </div>
        </div>
        <div className="card-body p-3 p-md-4">
          {categories.length === 0 ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">카테고리를 불러오는 중...</p>
            </div>
          ) : (
            <div className="row g-2 g-md-3">
              {categories.map((category) => (
                <div key={category.categoryId} className="col-6 col-sm-4 col-md-6 col-lg-4">
                  <div
                    className={`card border-2 h-100 ${
                      selectedCategory === category.categoryId
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                    }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '12px',
                      minHeight: '120px'
                    }}
                    onClick={() => setSelectedCategory(category.categoryId)}
                  >
                    <div className="card-body p-2 p-md-3 text-center d-flex flex-column justify-content-center">
                      <div className={`rounded-circle mx-auto mb-2 ${
                        selectedCategory === category.categoryId
                          ? 'bg-primary text-white'
                          : 'bg-light text-muted'
                      }`} style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="bi bi-bar-chart-fill" style={{ fontSize: '1.2rem' }}></i>
                      </div>
                      <h6 className="fw-bold mb-1 small">{category.title}</h6>
                      <p className="text-muted mb-0 d-none d-md-block" style={{
                        fontSize: '0.7rem',
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {category.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 투표 목록 */}
      {selectedCategory && (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-light border-0 p-3 p-md-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success bg-opacity-10 rounded-circle p-2">
                  <i className="bi bi-list-task text-success"></i>
                </div>
                <h5 className="mb-0 fw-bold text-dark fs-6 fs-md-5">투표 목록</h5>
              </div>
            </div>
          </div>
          <div
            className="card-body p-2 p-md-4"
            ref={scrollContainerRef}
            style={{
              maxHeight: window.innerWidth < 768 ? '70vh' : '800px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-dark mb-1">투표 목록을 불러오는 중...</h5>
                <p className="text-muted">잠시만 기다려주세요.</p>
              </div>
            ) : polls.length === 0 ? (
              <div className="text-center py-5">
                <div className="bg-light rounded-circle mx-auto mb-4" style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="bi bi-bar-chart fs-1 text-secondary"></i>
                </div>
                <h5 className="text-dark mb-2">투표가 없습니다</h5>
                <p className="text-muted">선택한 카테고리에 등록된 투표가 없습니다.</p>
              </div>
            ) : (
              <>
                <div className="row g-2 g-md-3">
                  {polls.map((poll) => (
                    <PollCard
                      key={poll.pollId}
                      poll={poll}
                      onClick={handlePollClick}
                      onAuthorClick={handleAuthorClick}
                      onDelete={handleDeletePoll}
                    />
                  ))}
                </div>

                {/* 더보기 버튼 및 로딩 상태 */}
                {hasMore && (
                  <div className="text-center py-4">
                    {isLoadingMore ? (
                      <div>
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted small">더 많은 투표를 불러오는 중...</p>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-primary rounded-pill px-4 py-2"
                        onClick={() => fetchPolls(selectedCategory, true)}
                        disabled={!cursorRef.current}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        더 많은 투표 보기
                      </button>
                    )}
                  </div>
                )}

                {/* 더 이상 불러올 데이터가 없을 때 */}
                {!hasMore && polls.length > 0 && (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-check-circle me-2"></i>
                      모든 투표를 불러왔습니다. (총 {polls.length}개)
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 유저 상세 모달 */}
      <UserDetailModal
        show={!!selectedUser}
        onHide={handleCloseModal}
        user={selectedUser}
      />
    </div>
  );
};

export default PollManagement;