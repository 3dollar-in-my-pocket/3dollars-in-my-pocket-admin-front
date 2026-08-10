import React, {useCallback, useState} from 'react';
import storeApi from '@/api/storeApi';
import StorePostItem from '@/components/StorePostItem';
import StorePostDetailModal from '@/components/StorePostDetailModal';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {StorePost} from '@/types/storePost';

interface StorePostHistoryProps {
  storeId: string;
}

const StorePostHistory: React.FC<StorePostHistoryProps> = ({storeId}) => {
  const [selectedPost, setSelectedPost] = useState<StorePost | null>(null);

  const fetchPosts = useCallback(
    (cursor: string | null) => storeApi.getStorePosts(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StorePost>({
    fetcher: fetchPosts,
    enabled: Boolean(storeId),
    deps: [storeId],
    errorMessage: '소식을 불러오는데 실패했습니다.'
  });

  return (
    <>
      <HistoryPanel
        title="가게 소식"
        icon="bi-newspaper"
        count={posts.length}
        hasMore={hasMore}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        error={error}
        onRefresh={refresh}
        onLoadMore={loadMore}
        emptyTitle="등록된 소식이 없습니다"
        emptyDescription="아직 가게에서 올린 소식이 없어요."
      >
        {posts.map((post, index) => (
          <StorePostItem key={post.postId || index} post={post} onClick={setSelectedPost}/>
        ))}
      </HistoryPanel>

      <StorePostDetailModal
        show={!!selectedPost}
        onHide={() => setSelectedPost(null)}
        post={selectedPost}
      />
    </>
  );
};

export default StorePostHistory;
