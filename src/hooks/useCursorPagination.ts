import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiResponse, PaginatedResponse } from '../types/api';

/**
 * 커서 페이지네이션 fetcher
 * @param cursor - 다음 페이지 커서 (첫 페이지는 null)
 * @returns 서버의 공통 커서 페이지네이션 응답
 */
export type CursorFetcher<T> = (
  cursor: string | null
) => Promise<ApiResponse<PaginatedResponse<T>> | null | undefined>;

export interface CursorPaginationConfig<T> {
  /** 페이지를 조회하는 함수. useCallback으로 감싸 참조를 안정화하세요. */
  fetcher: CursorFetcher<T>;
  /** false면 조회하지 않습니다. (예: 비활성 탭) */
  enabled?: boolean;
  /** 값이 바뀌면 목록을 초기화하고 첫 페이지를 다시 조회합니다. */
  deps?: unknown[];
  /** 조회 실패 시 error에 담을 메시지 */
  errorMessage?: string;
}

export interface CursorPaginationResult<T> {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  isLoading: boolean;
  /** 두 번째 페이지 이후를 불러오는 중인지 여부 */
  isLoadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  error: string | null;
  /** 첫 페이지부터 다시 조회 */
  refresh: () => void;
  /** 다음 페이지 조회 */
  loadMore: () => void;
}

/**
 * 커서 기반 페이지네이션 상태 관리 훅
 *
 * 서버 공통 응답 모델(`{ contents, cursor: { hasMore, nextCursor, totalCount } }`)을
 * 전제로 목록/로딩/커서 상태를 일괄 관리합니다.
 *
 * 동시 호출 방지와 최신 커서 참조를 ref로 처리하므로,
 * 반환된 refresh/loadMore는 렌더링 간 참조가 안정적입니다.
 */
export function useCursorPagination<T>({
  fetcher,
  enabled = true,
  deps = [],
  errorMessage = '데이터를 불러오는데 실패했습니다.'
}: CursorPaginationConfig<T>): CursorPaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // 렌더링 간 최신 값을 참조하기 위한 ref (콜백 재생성 방지)
  const cursorRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  const errorMessageRef = useRef(errorMessage);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  useEffect(() => {
    errorMessageRef.current = errorMessage;
  }, [errorMessage]);

  const load = useCallback(async (reset: boolean) => {
    // 중복 호출 방지
    if (isFetchingRef.current) return;
    // 더보기인데 남은 페이지가 없으면 차단
    if (!reset && !cursorRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    if (!reset) setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetcherRef.current(reset ? null : cursorRef.current);

      if (!response?.ok) {
        setError(errorMessageRef.current);
        return;
      }

      const { contents = [], cursor } = response.data || ({} as PaginatedResponse<T>);
      const nextCursor = cursor?.nextCursor ?? null;

      setItems(prev => (reset ? contents : [...prev, ...contents]));
      setHasMore(Boolean(cursor?.hasMore));
      setTotalCount(cursor?.totalCount || 0);
      cursorRef.current = nextCursor;
    } catch (e) {
      setError(errorMessageRef.current);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const refresh = useCallback(() => {
    cursorRef.current = null;
    load(true);
  }, [load]);

  const loadMore = useCallback(() => {
    load(false);
  }, [load]);

  // enabled/deps 변경 시 첫 페이지부터 재조회
  useEffect(() => {
    if (!enabled) return;
    cursorRef.current = null;
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  return {
    items,
    setItems,
    isLoading,
    isLoadingMore,
    hasMore,
    totalCount,
    error,
    refresh,
    loadMore
  };
}

export default useCursorPagination;
