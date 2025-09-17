import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import pollApi from '../../api/pollApi';
import SearchHeader from '../../components/common/SearchHeader';
import PollCard from '../../components/poll/PollCard';

const PollManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [polls, setPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
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

        setHasMore(response.data.cursor.hasMore);

        // 다음 페이지 커서 설정 (마지막 아이템의 pollId 사용)
        if (response.data.cursor.hasMore && newPolls.length > 0) {
          cursorRef.current = newPolls[newPolls.length - 1].pollId;
        } else {
          cursorRef.current = null;
        }
      }
    } catch (error) {
      console.error('투표 목록 조회 실패:', error);
      toast.error('투표 목록을 불러오는데 실패했습니다.');
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

  // 무한 스크롤 처리
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // 하단에서 100px 전에 로딩 시작

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      fetchPolls(selectedCategory, true);
    }
  }, [selectedCategory, isLoadingMore, hasMore]);

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

  return (
    <div className="container-fluid px-4 py-4">
      <SearchHeader
        title="📊 투표 관리"
        description="투표를 관리하고 결과를 확인하세요"
        icon="bi-bar-chart-fill"
      />

      {/* 카테고리 선택 */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-light border-0 p-4">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary bg-opacity-10 rounded-circle p-2">
              <i className="bi bi-grid-3x3-gap text-primary"></i>
            </div>
            <h5 className="mb-0 fw-bold text-dark">카테고리 선택</h5>
          </div>
        </div>
        <div className="card-body p-4">
          {categories.length === 0 ? (
            <div className="text-center py-3">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">카테고리를 불러오는 중...</p>
            </div>
          ) : (
            <div className="row g-3">
              {categories.map((category) => (
                <div key={category.categoryId} className="col-12 col-md-6 col-lg-4">
                  <div
                    className={`card border-2 h-100 ${
                      selectedCategory === category.categoryId
                        ? 'border-primary bg-primary bg-opacity-10'
                        : 'border-light'
                    }`}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderRadius: '12px'
                    }}
                    onClick={() => setSelectedCategory(category.categoryId)}
                  >
                    <div className="card-body p-3 text-center">
                      <div className={`rounded-circle mx-auto mb-2 ${
                        selectedCategory === category.categoryId
                          ? 'bg-primary text-white'
                          : 'bg-light text-muted'
                      }`} style={{
                        width: '50px',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="bi bi-bar-chart-fill fs-5"></i>
                      </div>
                      <h6 className="fw-bold mb-1">{category.title}</h6>
                      <p className="text-muted small mb-0" style={{
                        fontSize: '0.75rem',
                        lineHeight: '1.2'
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
          <div className="card-header bg-light border-0 p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-success bg-opacity-10 rounded-circle p-2">
                  <i className="bi bi-list-task text-success"></i>
                </div>
                <h5 className="mb-0 fw-bold text-dark">투표 목록</h5>
              </div>
              {polls.length > 0 && (
                <span className="badge bg-success px-3 py-2 rounded-pill">
                  총 {polls.length}개
                  {hasMore && '+'}
                </span>
              )}
            </div>
          </div>
          <div
            className="card-body p-4"
            ref={scrollContainerRef}
            style={{
              maxHeight: '800px',
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
                <div className="row g-3">
                  {polls.map((poll) => (
                    <PollCard
                      key={poll.pollId}
                      poll={poll}
                      onClick={handlePollClick}
                    />
                  ))}
                </div>

                {/* 더 불러오기 로딩 */}
                {isLoadingMore && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted small">더 많은 투표를 불러오는 중...</p>
                  </div>
                )}

                {/* 더 이상 불러올 데이터가 없을 때 */}
                {!hasMore && polls.length > 0 && (
                  <div className="text-center py-4">
                    <div className="text-muted">
                      <i className="bi bi-check-circle me-2"></i>
                      모든 투표를 불러왔습니다.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PollManagement;