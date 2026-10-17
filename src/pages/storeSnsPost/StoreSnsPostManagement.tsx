import {useCallback, useState} from 'react';
import storeSnsPostLinkApi from '@/api/storeSnsPostLinkApi';
import SnsPostItem from '@/components/SnsPostItem';
import SnsPostDetailModal from '@/components/SnsPostDetailModal';
import StoreDetailModal from '@/pages/store/StoreDetailModal';
import EmptyState from '@/components/common/EmptyState';
import PageHeader from '@/components/common/PageHeader';
import FilterCard from '@/components/common/FilterCard';
import SectionCard from '@/components/common/SectionCard';
import useInfiniteScroll from '@/hooks/useInfiniteScroll';
import useCursorPagination from '@/hooks/useCursorPagination';
import {SimpleStore} from '@/types/store';
import {StorePost} from '@/types/storePost';
import {SnsPlatform, StoreSnsPostLinkSort} from '@/types/storeSnsPostLink';
import {SNS_PLATFORM_LABELS, SNS_PLATFORMS} from '@/constants/snsPost';

const SORT_OPTIONS: { value: StoreSnsPostLinkSort; label: string }[] = [
  {value: 'LATEST', label: '최신순'},
  {value: 'OLDEST', label: '오래된순'}
];

const PLATFORM_OPTIONS: { value: SnsPlatform | null; label: string }[] = [
  {value: null, label: '전체'},
  ...SNS_PLATFORMS.map(platform => ({value: platform, label: SNS_PLATFORM_LABELS[platform]})),
];

const StoreSnsPostManagement = () => {
  const [sortBy, setSortBy] = useState<StoreSnsPostLinkSort>('LATEST');
  const [platform, setPlatform] = useState<SnsPlatform | null>(null);
  const [selectedPost, setSelectedPost] = useState<StorePost | null>(null);
  const [selectedStore, setSelectedStore] = useState<SimpleStore | null>(null);

  const fetchPosts = useCallback(
    (cursor: string | null) => storeSnsPostLinkApi.listAll(cursor, sortBy, platform ? [platform] : []),
    [sortBy, platform]
  );

  const {items: posts, isLoading, hasMore, error, refresh, loadMore} = useCursorPagination<StorePost>({
    fetcher: fetchPosts,
    deps: [sortBy, platform],
    errorMessage: 'SNS 포스트를 불러오지 못했습니다.'
  });

  const {loadMoreRef} = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
    threshold: 0.1,
    rootMargin: '0px 0px 160px 0px',
  });

  return (
    <div>
      <PageHeader
        description="전체 가게에 등록된 Threads·Instagram 포스트를 조회합니다. 스크롤하면 다음 포스트를 자동으로 불러옵니다."
        actions={
          <button className="btn btn-outline-primary" onClick={refresh} disabled={isLoading}>
            <i className="bi bi-arrow-clockwise me-1"/>
            새로고침
          </button>
        }
      />

      <FilterCard title="플랫폼" icon="bi-funnel">
        <div className="filter-chips">
          {PLATFORM_OPTIONS.map((option) => (
            <button
              key={option.value ?? 'ALL'}
              type="button"
              className={`filter-chip ${platform === option.value ? 'filter-chip--active' : ''}`}
              onClick={() => setPlatform(option.value)}
              disabled={isLoading}
            >
              {option.label}
            </button>
          ))}
        </div>
      </FilterCard>

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
        title="SNS 포스트"
        icon="bi-link-45deg"
        aside={posts.length > 0 && (
          <span className="page-count">{posts.length.toLocaleString()}{hasMore ? '+' : ''}건</span>
        )}
      >
        <div>
          {posts.length === 0 && !isLoading && !error && (
            <EmptyState
              icon="bi-link-45deg"
              title="등록된 SNS 포스트가 없습니다"
              description="조회할 수 있는 SNS 포스트가 없습니다."
            />
          )}

          {posts.length > 0 && (
            <div className="mx-auto" style={{maxWidth: '760px'}}>
              {posts.map(post => (
                <SnsPostItem key={post.postId} post={post} onClick={setSelectedPost} onStoreClick={setSelectedStore}/>
              ))}
            </div>
          )}

          {isLoading && posts.length === 0 && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">SNS 포스트 불러오는 중</span>
              </div>
            </div>
          )}

          {hasMore && posts.length > 0 && (
            <div ref={loadMoreRef} className="text-center py-4">
              {isLoading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">추가 SNS 포스트 불러오는 중</span>
                </div>
              )}
            </div>
          )}
        </div>
      </SectionCard>

      <SnsPostDetailModal
        show={!!selectedPost}
        onHide={() => setSelectedPost(null)}
        post={selectedPost}
        onStoreClick={setSelectedStore}
      />

      <StoreDetailModal
        show={!!selectedStore}
        onHide={() => setSelectedStore(null)}
        store={selectedStore}
      />
    </div>
  );
};

export default StoreSnsPostManagement;
