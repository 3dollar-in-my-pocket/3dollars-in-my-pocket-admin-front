import {useCallback, useEffect, useRef, useState} from 'react';
import storeThreadsPostLinkApi from '@/api/storeThreadsPostLinkApi';
import {ApiResponse} from '@/types/api';
import {StoreThreadsPostLink, StoreThreadsPostLinkSort} from '@/types/storeThreadsPostLink';

export function threadsErrorMessage(response: ApiResponse, fallback: string): string {
  const messages: Record<string, string> = {
    unauthorized: '관리자 인증이 만료되었습니다. 다시 로그인해주세요.',
    forbidden_access_denied: 'Threads 링크 등록·삭제는 운영자 이상 권한이 필요합니다.',
    forbidden_not_post_owner: '이 포스트를 삭제할 권한이 없습니다.',
    not_exists_store: '가게를 찾을 수 없습니다. 가게 정보를 확인해주세요.',
    not_exists_post: '이미 삭제되었거나 이 가게에 등록되지 않은 포스트입니다.',
    invalid_threads_post_link: '올바른 Threads 포스트 URL을 입력해주세요.',
  };
  return messages[response.error] || response.message || fallback;
}

export default function useStoreThreadsPostLinks(storeId: string, sortBy: StoreThreadsPostLinkSort) {
  const [items, setItems] = useState<StoreThreadsPostLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cursorRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const fetchingRef = useRef<number | null>(null);

  const load = useCallback(async (reset = true): Promise<boolean> => {
    if (fetchingRef.current !== null || (!reset && !cursorRef.current)) return false;
    const generation = generationRef.current;
    fetchingRef.current = generation;
    setIsLoading(true);
    setIsLoadingMore(!reset);
    setError(null);
    try {
      let response = await storeThreadsPostLinkApi.list(storeId, reset ? null : cursorRef.current, sortBy);
      if (generation !== generationRef.current) return false;
      // 복구는 한 번만 수행한다. 다른 Base64 오류까지 커서 오류로 간주하지 않는다.
      if (!response.ok && response.error === 'invalid_cursor' && !reset) {
        cursorRef.current = null;
        setHasMore(false);
        reset = true;
        response = await storeThreadsPostLinkApi.list(storeId, null, sortBy);
      }
      if (generation !== generationRef.current) return false;
      if (!response.ok || !response.data) {
        setError(threadsErrorMessage(response, 'Threads 링크 목록을 불러오지 못했습니다.'));
        return false;
      }
      const {contents, cursor} = response.data;
      setItems(prev => reset ? contents : [...prev, ...contents]);
      // hasMore가 false이면 nextCursor가 남아 있어도 추가 요청하지 않는다.
      cursorRef.current = cursor.hasMore ? cursor.nextCursor || null : null;
      setHasMore(Boolean(cursorRef.current));
      return true;
    } catch {
      if (generation === generationRef.current) setError('Threads 링크 목록을 불러오지 못했습니다.');
      return false;
    } finally {
      if (generation === generationRef.current) {
        fetchingRef.current = null;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [storeId, sortBy]);

  useEffect(() => {
    cursorRef.current = null;
    fetchingRef.current = null;
    setItems([]);
    setHasMore(false);
    void load();
    return () => { generationRef.current += 1; };
  }, [load]);

  return {items, isLoading, isLoadingMore, hasMore, error, refresh: load, loadMore: () => load(false)};
}
