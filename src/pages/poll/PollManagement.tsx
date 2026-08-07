import {useState, useEffect, useCallback, useRef} from 'react';
import {toast} from 'react-toastify';
import pollApi from '@/api/pollApi';
import SearchHeader from '@/components/common/SearchHeader';
import useCursorPagination from '@/hooks/useCursorPagination';
import PollCard from '@/components/poll/PollCard';
import UserDetailModal from '@/pages/user/UserDetailModal';

import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';
import {Poll, PollCategory, PollOption} from '@/types/poll';
import {Writer} from '@/types/domain';

const PollManagement = () => {
  const [categories, setCategories] = useState<PollCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 카테고리 목록 조회
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await pollApi.getPollCategories();
      if (response.ok) {
        const contents = response.data?.contents || [];
        setCategories(contents);
        // 첫 번째 카테고리를 기본 선택
        if (contents.length > 0) {
          setSelectedCategory(contents[0].categoryId);
        }
      }
    };

    fetchCategories();
  }, []);

  // 투표 목록 조회
  const fetchPollPage = useCallback(
    (cursor: string | null) => pollApi.getPolls(selectedCategory, 30, cursor),
    [selectedCategory]
  );

  const {
    items: polls,
    isLoading,
    isLoadingMore,
    hasMore,
    refresh: fetchPolls,
    loadMore
  } = useCursorPagination<Poll>({
    fetcher: fetchPollPage,
    enabled: Boolean(selectedCategory),
    deps: [selectedCategory],
    errorMessage: '투표 목록을 불러오지 못했습니다.'
  });

  // 무한 스크롤 처리 (디바운싱 추가)
  const lastScrollTime = useRef(0);
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const now = Date.now();
    // 300ms 디바운싱으로 중복 호출 방지
    if (now - lastScrollTime.current < 300) return;

    const {scrollTop, scrollHeight, clientHeight} = container;
    const threshold = 100; // 하단에서 100px 전에 로딩 시작

    // 스크롤이 하단 근처에 도달했을 때만 더보기 실행
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      lastScrollTime.current = now;
      loadMore();
    }
  }, [isLoadingMore, hasMore, loadMore]);

  // 스크롤 이벤트 등록
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // 투표 상세보기 (일단 로그만 출력)
  const handlePollClick = (poll: Poll) => {
  };

  // 작성자 클릭 핸들러
  const handleAuthorClick = (writer: Writer | null | undefined) => {
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
  const handleDeletePoll = async (poll: Poll) => {
    const confirmed = window.confirm(
      `정말로 "${poll.content.title}" 투표를 삭제하시겠습니까?\n\n` +
      `투표 기간: ${formatDateTime(poll.period.startDateTime)} ~ ${formatDateTime(poll.period.endDateTime)}\n` +
      `현재 참여자: ${getTotalVotes(poll.options)}명\n\n` +
      `이 작업은 되돌릴 수 없습니다.`
    );

    if (!confirmed) return;

    const response = await pollApi.deletePoll(poll.pollId);
    if (response.ok) {
      toast.success('투표가 성공적으로 삭제되었습니다.');
      fetchPolls();
    }
  };

  // 투표 총 참여자 수 계산 (확인 메시지용)
  const getTotalVotes = (options: PollOption[]) => {
    return options.reduce((total, option) => total + (option.count || 0), 0);
  };

  // 날짜 포맷팅 (확인 메시지용)

  return (
    <div className="container-fluid px-2 px-md-4 py-3 py-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold">투표 관리</h2>
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
                        <i className="bi bi-bar-chart-fill" style={{fontSize: '1.2rem'}}></i>
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
            {isLoading && polls.length === 0 ? (
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
                        onClick={loadMore}
                        disabled={isLoadingMore}
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
        onStoreClick={() => {
        }}
      />
    </div>
  );
};

export default PollManagement;
