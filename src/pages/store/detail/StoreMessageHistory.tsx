import React, {useCallback} from 'react';
import storeApi from '@/api/storeApi';
import StoreMessageItem from './StoreMessageItem';
import HistoryPanel from '@/components/common/HistoryPanel';
import useCursorPagination from '@/hooks/useCursorPagination';
import {StoreMessage} from '@/types/storeMessage';

interface StoreMessageHistoryProps {
  storeId: string;
}

const StoreMessageHistory: React.FC<StoreMessageHistoryProps> = ({storeId}) => {
  const fetchMessages = useCallback(
    (cursor: string | null) => storeApi.getStoreMessages(storeId, cursor, 20),
    [storeId]
  );

  const {
    items: messages,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore
  } = useCursorPagination<StoreMessage>({
    fetcher: fetchMessages,
    enabled: Boolean(storeId),
    deps: [storeId],
    errorMessage: '메시지를 불러오는데 실패했습니다.'
  });

  return (
    <HistoryPanel
      title="가게 메시지"
      icon="bi-chat-dots"
      count={messages.length}
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      error={error}
      onRefresh={refresh}
      onLoadMore={loadMore}
      emptyTitle="등록된 메시지가 없습니다"
      emptyDescription="아직 가게에서 보낸 메시지가 없어요."
    >
      {messages.map((message, index) => (
        <StoreMessageItem key={message.messageId || index} message={message}/>
      ))}
    </HistoryPanel>
  );
};

export default StoreMessageHistory;
