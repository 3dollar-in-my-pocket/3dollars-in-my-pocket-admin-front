import React, {useEffect, useRef} from 'react';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import Loading from './Loading';

interface HistoryPanelProps {
  /** 패널 제목 (예: 가게 소식) */
  title: string;
  /** 제목 왼쪽 아이콘 (Bootstrap Icons 클래스명) */
  icon: string;
  /** 현재까지 불러온 항목 수. 0이면 빈 상태로 처리합니다. */
  count?: number;
  /**
   * 서버가 알려준 전체 건수.
   * 0보다 크면 건수 배지에 이 값을 우선 표시합니다.
   * (서버가 제공하지 않는 목록은 생략)
   */
  totalCount?: number;
  /** 다음 페이지가 더 있는지 (건수 배지에 + 표기) */
  hasMore?: boolean;
  /** 첫 페이지 로딩 여부 */
  isLoading?: boolean;
  /** 추가 페이지 로딩 여부 */
  isLoadingMore?: boolean;
  /** 조회 실패 메시지 */
  error?: string | null;
  /** 다시 시도 / 새로고침 */
  onRefresh?: () => void;
  /** 다음 페이지 로드. 없으면 더보기 버튼을 숨깁니다. */
  onLoadMore?: () => void;
  /** 항목이 없을 때 안내 문구 */
  emptyTitle?: string;
  emptyDescription?: string;
  /** 헤더 우측 추가 영역 (필터 등) */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * 상세 모달 탭 안의 이력 목록 공통 레이아웃
 *
 * 로딩 / 오류 / 빈 상태 / 더보기를 한 곳에서 처리해 각 탭 컴포넌트가
 * 목록 렌더링에만 집중하도록 합니다.
 */
const HistoryPanel: React.FC<HistoryPanelProps> = ({
                                                     title,
                                                     icon,
                                                     count = 0,
                                                     totalCount = 0,
                                                     hasMore = false,
                                                     isLoading = false,
                                                     isLoadingMore = false,
                                                     error,
                                                     onRefresh,
                                                     onLoadMore,
                                                     emptyTitle = '데이터가 없습니다',
                                                     emptyDescription,
                                                     aside,
                                                     children
                                                   }) => {
  const isEmpty = count === 0;
  // 서버가 전체 건수를 주면 그 값을, 아니면 불러온 개수 + 더보기 여부를 표시한다
  const hasTotal = totalCount > 0;
  const displayCount = hasTotal ? totalCount : count;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // 최신 콜백/상태를 참조해 Observer를 재생성하지 않는다
  const loadMoreRef = useRef(onLoadMore);
  const canLoadRef = useRef(false);

  loadMoreRef.current = onLoadMore;
  canLoadRef.current = hasMore && !isLoading && !isLoadingMore && !error;

  // 목록 하단이 보이면 다음 페이지를 자동으로 불러온다 (더보기 버튼은 폴백)
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && canLoadRef.current) {
        loadMoreRef.current?.();
      }
    }, {rootMargin: '0px 0px 160px 0px'});

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isEmpty]);

  return (
    <div className="history-panel">
      <div className="history-panel__head">
        <h3 className="history-panel__title">
          <i className={`bi ${icon}`}/>
          {title}
          {count > 0 && (
            <span className="history-panel__count">
              {displayCount.toLocaleString()}{!hasTotal && hasMore ? '+' : ''}
            </span>
          )}
        </h3>
        <div className="history-panel__aside">
          {aside}
          {onRefresh && (
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <i className="bi bi-arrow-clockwise me-1"/>
              새로고침
            </button>
          )}
        </div>
      </div>

      {isLoading && isEmpty ? (
        <div className="py-5">
          <Loading/>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRefresh}/>
      ) : isEmpty ? (
        <EmptyState icon={icon} title={emptyTitle} description={emptyDescription}/>
      ) : (
        <>
          {children}

          {hasMore && onLoadMore && (
            <div className="text-center pt-3" ref={sentinelRef}>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={onLoadMore}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"/>
                    불러오는 중...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-1"/>
                    더보기
                  </>
                )}
              </button>
            </div>
          )}

          {!hasMore && (
            <p className="history-panel__end">
              <i className="bi bi-check-circle me-1"/>
              모두 불러왔습니다 (총 {displayCount.toLocaleString()}건)
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default HistoryPanel;
