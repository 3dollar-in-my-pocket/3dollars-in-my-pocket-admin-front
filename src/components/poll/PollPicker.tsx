import {useCallback, useState} from 'react';
import pollApi from '@/api/pollApi';
import useCursorPagination from '@/hooks/useCursorPagination';
import EmptyState from '@/components/common/EmptyState';
import PollSearchBox from '@/components/poll/PollSearchBox';
import {Poll} from '@/types/poll';
import {getPollStatus, getTotalVotes, POLL_STATUS_CONFIG} from '@/utils/display/pollDisplay';

const PAGE_SIZE = 30;

interface PollPickerProps {
  /** 고정할 카테고리. 다른 카테고리의 투표는 선택할 수 없다. */
  categoryId: string;
  onSelect: (poll: Poll) => void;
}

/**
 * 고정할 투표 선택 목록
 *
 * 기본은 카테고리 인기순 목록, 검색어가 있으면 제목 검색 결과를 보여준다.
 */
const PollPicker = ({categoryId, onSelect}: PollPickerProps) => {
  const [keyword, setKeyword] = useState('');

  const fetcher = useCallback(
    (cursor: string | null) => keyword
      ? pollApi.searchPolls(keyword, PAGE_SIZE, cursor)
      : pollApi.getPolls(categoryId, PAGE_SIZE, null, 'POPULAR'),
    [categoryId, keyword]
  );

  const {items, isLoading, isLoadingMore, hasMore, error, loadMore} = useCursorPagination<Poll>({
    fetcher,
    enabled: Boolean(categoryId),
    deps: [categoryId, keyword],
    errorMessage: '투표 목록을 불러오지 못했습니다.'
  });

  return (
    <div>
      <PollSearchBox keyword={keyword} onSearch={setKeyword} onClear={() => setKeyword('')}/>
      <div className="small text-muted mt-2 mb-1">
        {keyword ? `"${keyword}" 검색 결과 (최신순)` : '인기순 투표'}
      </div>

      <div className="list-group" style={{maxHeight: 280, overflowY: 'auto'}}>
        {isLoading && items.length === 0 ? (
          <div className="text-center py-4">
            <span className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">불러오는 중</span>
            </span>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={error ? 'bi-exclamation-circle' : 'bi-bar-chart'}
            title={error ?? (keyword ? '검색 결과가 없습니다' : '인기 투표가 없습니다')}
            description={keyword ? '다른 검색어로 다시 시도해주세요.' : '투표 제목으로 검색해 선택할 수 있습니다.'}
          />
        ) : (
          <>
            {items.map(poll => {
              const status = POLL_STATUS_CONFIG[getPollStatus(poll)];
              const otherCategory = poll.category.categoryId !== categoryId;
              return (
                <button
                  key={poll.pollId}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => onSelect(poll)}
                  disabled={otherCategory}
                  title={otherCategory ? '다른 카테고리의 투표는 고정할 수 없습니다.' : undefined}
                >
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold text-truncate">{poll.content.title}</span>
                    <span className={`badge ${status.badgeClass} ms-auto flex-shrink-0`}>{status.text}</span>
                  </div>
                  <div className="small text-muted">
                    ID {poll.pollId} · {poll.category.title} · {getTotalVotes(poll.options).toLocaleString()}명 참여
                    {otherCategory && ' · 다른 카테고리'}
                  </div>
                </button>
              );
            })}
            {hasMore && (
              <button
                type="button"
                className="list-group-item list-group-item-action text-center text-primary small"
                onClick={loadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? '불러오는 중...' : '더 보기'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PollPicker;
