import {useCallback, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';
import pollApi from '@/api/pollApi';
import useCursorPagination from '@/hooks/useCursorPagination';
import PollCard from '@/components/poll/PollCard';
import PollDetailModal from '@/components/poll/PollDetailModal';
import UserDetailModal from '@/pages/user/UserDetailModal';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import EmptyState from '@/components/common/EmptyState';

import {formatDateTimeShortKo as formatDateTime} from '@/utils/dateUtils';
import {Poll, PollCategory} from '@/types/poll';
import {Writer} from '@/types/domain';
import {getTotalVotes} from '@/utils/display/pollDisplay';

const PollManagement = () => {
  const [categories, setCategories] = useState<PollCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
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

  // 투표 상세보기
  const handlePollClick = (poll: Poll) => {
    setSelectedPoll(poll);
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
      setSelectedPoll(null);
      fetchPolls();
    }
  };

  return (
    <div>
      <PageHeader description="카테고리별 투표 목록을 조회하고 삭제합니다."/>

      <FilterCard title="카테고리" icon="bi-grid-3x3-gap">
        {categories.length === 0 ? (
          <div className="text-center py-3">
            <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
            <span className="small text-muted">카테고리를 불러오는 중...</span>
          </div>
        ) : (
          <div className="row g-2">
            {categories.map((category) => (
              <div key={category.categoryId} className="col-6 col-md-4 col-xl-3">
                <button
                  type="button"
                  className={`form-option w-100 h-100 ${
                    selectedCategory === category.categoryId ? 'form-option--active' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.categoryId)}
                  aria-pressed={selectedCategory === category.categoryId}
                >
                  <i className="bi bi-bar-chart-fill form-option__icon"/>
                  <span className="min-w-0">
                    <span className="form-option__name">{category.title}</span>
                    {category.content && (
                      <span className="form-option__desc text-clamp-2">{category.content}</span>
                    )}
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </FilterCard>

      {/* 투표 목록 */}
      {selectedCategory && (
        <SectionCard
          title="투표 목록"
          icon="bi-list-task"
          aside={polls.length > 0 && (
            <span className="page-count">{polls.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
          )}
        >
          <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 380px)', overflowY: 'auto'}}>
            {isLoading && polls.length === 0 ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">불러오는 중</span>
                </div>
                <p className="text-muted small mt-3 mb-0">투표 목록을 불러오는 중...</p>
              </div>
            ) : polls.length === 0 ? (
              <EmptyState
                icon="bi-bar-chart"
                title="투표가 없습니다"
                description="선택한 카테고리에 등록된 투표가 없습니다."
              />
            ) : (
              <>
                <div className="row g-3">
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

                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      className="btn btn-outline-primary"
                      onClick={loadMore}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"/>
                          불러오는 중...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-plus-circle me-1"/>
                          더 보기
                        </>
                      )}
                    </button>
                  </div>
                )}

                {!hasMore && (
                  <p className="text-center text-secondary small pt-4 mb-0">
                    <i className="bi bi-check-circle me-1"/>
                    모든 투표를 불러왔습니다 (총 {polls.length.toLocaleString()}건)
                  </p>
                )}
              </>
            )}
          </div>
        </SectionCard>
      )}

      {/* 투표 상세 모달 */}
      <PollDetailModal
        show={!!selectedPoll}
        onHide={() => setSelectedPoll(null)}
        poll={selectedPoll}
        onAuthorClick={handleAuthorClick}
        onDelete={handleDeletePoll}
      />

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
