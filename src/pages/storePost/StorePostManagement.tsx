import {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Form} from 'react-bootstrap';
import storePostApi from '../../api/storePostApi';
import StorePostItem from '../../components/StorePostItem';
import EmptyState from '../../components/common/EmptyState';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {STORE_POST_SORT, StorePost, StorePostSort} from '../../types/storePost';

const StorePostManagement = () => {
  const [posts, setPosts] = useState<StorePost[]>([]);
  const [sortBy, setSortBy] = useState<StorePostSort>(STORE_POST_SORT.LATEST);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');

  const cursorRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);
  const requestSequenceRef = useRef(0);

  const fetchPosts = useCallback(async (reset = false) => {
    if (isLoadingRef.current && !reset) return;
    if (!reset && !cursorRef.current) return;

    const requestSequence = reset
      ? ++requestSequenceRef.current
      : requestSequenceRef.current;

    if (reset) {
      cursorRef.current = null;
      setPosts([]);
      setHasMore(false);
      setError('');
    }

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const response = await storePostApi.getStorePosts(sortBy, reset ? null : cursorRef.current);
      if (requestSequence !== requestSequenceRef.current) return;

      const {contents = [], cursor} = response.data || {};

      setPosts(prev => reset ? contents : [...prev, ...contents]);
      setHasMore(cursor?.hasMore || false);
      cursorRef.current = cursor?.nextCursor || null;
    } catch (error) {
      if (requestSequence === requestSequenceRef.current) {
        setError('가게 소식을 불러오지 못했습니다.');
      }
    } finally {
      if (requestSequence === requestSequenceRef.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }
  }, [sortBy]);

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: () => fetchPosts(false),
    threshold: 0.1,
    rootMargin: '0px 0px 160px 0px',
  });

  return (
    <div className="container-fluid px-2 px-md-4 py-2 py-md-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 mb-md-4 pb-2 border-bottom">
        <h2 className="fw-bold mb-0" style={{fontSize: 'clamp(1.25rem, 5vw, 2rem)'}}>
          <i className="bi bi-newspaper text-info me-2"></i>
          가게 소식
        </h2>

        <div className="d-flex align-items-center gap-2">
          <Form.Select
            aria-label="가게 소식 정렬"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as StorePostSort)}
            disabled={isLoading}
            size="sm"
            style={{width: '120px', minHeight: '38px'}}
          >
            <option value={STORE_POST_SORT.LATEST}>최신순</option>
            <option value={STORE_POST_SORT.OLDEST}>오래된순</option>
          </Form.Select>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
            onClick={() => fetchPosts(true)}
            disabled={isLoading}
            style={{minHeight: '38px'}}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            <span className="d-none d-sm-inline">새로고침</span>
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-3 bg-info bg-opacity-10">
        <div className="card-body p-3">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <small className="text-muted">
              전체 가게에 등록된 소식을 조회합니다. 스크롤하면 다음 소식을 자동으로 불러옵니다.
            </small>
            {posts.length > 0 && (
              <span className="badge bg-info rounded-pill text-nowrap">
                {posts.length.toLocaleString()}{hasMore ? '+' : ''}개
              </span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => fetchPosts(true)}>
            다시 시도
          </button>
        </Alert>
      )}

      <div
        ref={scrollContainerRef}
        style={{maxHeight: 'calc(100vh - 260px)', overflowY: 'auto'}}
      >
        {posts.length === 0 && !isLoading && !error ? (
          <EmptyState
            icon="bi-newspaper"
            title="등록된 가게 소식이 없습니다"
            description="조회할 수 있는 가게 소식이 없습니다."
          />
        ) : (
          <div className="mx-auto" style={{maxWidth: '760px'}}>
            {posts.map(post => (
              <StorePostItem key={post.postId} post={post}/>
            ))}
          </div>
        )}

        {isLoading && posts.length === 0 && (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status">
              <span className="visually-hidden">가게 소식 불러오는 중</span>
            </div>
          </div>
        )}

        {hasMore && posts.length > 0 && (
          <div ref={loadMoreRef} className="text-center py-4">
            {isLoading && (
              <div className="spinner-border spinner-border-sm text-info" role="status">
                <span className="visually-hidden">추가 가게 소식 불러오는 중</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePostManagement;
