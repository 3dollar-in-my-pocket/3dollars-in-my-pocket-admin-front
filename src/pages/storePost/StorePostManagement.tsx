import {useCallback, useState} from 'react';
import storePostApi from '@/api/storePostApi';
import StorePostItem from '@/components/StorePostItem';
import StorePostDetailModal from '@/components/StorePostDetailModal';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import {STORE_POST_SORT, StorePost, StorePostSort} from '@/types/storePost';

const SORT_OPTIONS: { value: StorePostSort; label: string }[] = [
  {value: STORE_POST_SORT.LATEST, label: '최신순'},
  {value: STORE_POST_SORT.OLDEST, label: '오래된순'}
];

const StorePostManagement = () => {
  const [sortBy, setSortBy] = useState<StorePostSort>(STORE_POST_SORT.LATEST);
  const [selectedPost, setSelectedPost] = useState<StorePost | null>(null);

  const fetchPosts = useCallback(
    (cursor: string | null) => storePostApi.getStorePosts(sortBy, cursor),
    [sortBy]
  );

  const {
    items: posts,
    isLoading,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StorePost>({
    fetcher: fetchPosts,
    deps: [sortBy],
    errorMessage: '가게 소식을 불러오지 못했습니다.'
  });

  const {scrollContainerRef, loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1,
    rootMargin: '0px 0px 160px 0px',
  });

  return (
    <div>
      <PageHeader
        description="전체 가게에 등록된 소식을 조회합니다. 스크롤하면 다음 소식을 자동으로 불러옵니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <FilterCard title="정렬" icon="bi-sort-down">
        <div className="filter-chips">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${sortBy === option.value ? 'filter-chip--active' : ''}`}
              onClick={() => setSortBy(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterCard>

      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center py-2" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={refresh}>
            다시 시도
          </button>
        </div>
      )}

      <SectionCard
        title="가게 소식"
        icon="bi-newspaper"
        aside={posts.length > 0 && (
          <span className="page-count">{posts.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div ref={scrollContainerRef} style={{maxHeight: 'calc(100vh - 340px)', overflowY: 'auto'}}>
          {posts.length === 0 && !isLoading && !error && (
            <EmptyState
              icon="bi-newspaper"
              title="등록된 가게 소식이 없습니다"
              description="조회할 수 있는 가게 소식이 없습니다."
            />
          )}

          {posts.length > 0 && (
            <div className="mx-auto" style={{maxWidth: '760px'}}>
              {posts.map(post => (
                <StorePostItem key={post.postId} post={post} onClick={setSelectedPost}/>
              ))}
            </div>
          )}

          {isLoading && posts.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">가게 소식 불러오는 중</span>
              </div>
            </div>
          )}

          {hasMore && posts.length > 0 && (
            <div ref={loadMoreRef} className="text-center py-4">
              {isLoading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">추가 가게 소식 불러오는 중</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <StorePostDetailModal
        show={!!selectedPost}
        onHide={() => setSelectedPost(null)}
        post={selectedPost}
      />
    </div>
  );
};

export default StorePostManagement;
