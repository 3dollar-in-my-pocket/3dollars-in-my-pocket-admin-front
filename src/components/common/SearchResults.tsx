import React from 'react';
import SectionCard from './SectionCard';
import EmptyState from './EmptyState';

interface SearchResultsProps<T = any> {
  /** 검색 결과 목록. 화면마다 도메인이 달라 제네릭으로 둡니다. */
  results?: T[];
  isLoading?: boolean;
  hasMore?: boolean;
  scrollContainerRef?: React.Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  emptyDescription?: string;
  loadingMessage?: string;
  title?: string;
}

const SearchResults = <T, >({
                              results = [],
                              isLoading = false,
                              hasMore = false,
                              scrollContainerRef,
                              onScroll,
                              renderItem,
                              emptyMessage = "검색 결과가 없습니다",
                              emptyDescription = "다른 검색어로 시도해보세요",
                              loadingMessage = "검색 중입니다",
                              title = "검색 결과"
                            }: SearchResultsProps<T>) => {
  const isInitialLoading = isLoading && results.length === 0;

  return (
    <SectionCard
      title={title}
      icon="bi-grid-3x3-gap"
      aside={results.length > 0 && <span className="page-count">{results.length}건</span>}
      flush
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        style={{maxHeight: 'calc(100vh - 320px)', overflowY: 'auto'}}
      >
        {isInitialLoading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{loadingMessage}</span>
            </div>
            <p className="text-muted small mt-3 mb-0">{loadingMessage}</p>
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <EmptyState
            icon="bi-search"
            title={emptyMessage}
            description={emptyDescription}
          />
        )}

        {results.length > 0 && (
          <div className="row g-3 p-3">
            {results.map((item, index) => renderItem(item, index))}
          </div>
        )}

        {hasMore && results.length > 0 && isLoading && (
          <div className="text-center py-3 border-top">
            <span className="spinner-border spinner-border-sm text-primary me-2" role="status"/>
            <span className="small text-muted">더 불러오는 중...</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
};

export default SearchResults;
