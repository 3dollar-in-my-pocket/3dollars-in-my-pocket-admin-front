import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {toast} from 'react-toastify';

export interface UseBulkSelectionConfig<T, K> {
  /** 현재 화면에 렌더링 중인 목록 (Shift 범위 선택의 기준 순서) */
  items: T[];
  /** 항목에서 선택 키를 추출 */
  getKey: (item: T) => K | null | undefined;
  /** 최대 선택 가능 개수 (미지정 시 무제한) */
  max?: number;
  /** 선택 가능 여부 (예: 삭제된 리뷰는 선택 불가) */
  isSelectable?: (item: T) => boolean;
  /**
   * 값이 바뀌면 선택을 초기화하는 의존성 목록.
   * 검색 조건 변경 시 화면에서 사라진 항목이 선택된 채 남는 것을 방지합니다.
   */
  resetDeps?: unknown[];
}

/**
 * 목록의 일괄 선택 상태를 관리합니다.
 *
 * - 내부는 Set으로 관리하여 선택 여부 판정이 O(1)입니다.
 * - Shift + 클릭으로 앵커(마지막 단일 클릭 항목)부터 현재 항목까지 범위 선택을 지원합니다.
 * - max 초과 시 앞에서부터 채우고 toast로 안내합니다.
 */
export const useBulkSelection = <T, K extends string | number>({
                                                                 items,
                                                                 getKey,
                                                                 max,
                                                                 isSelectable,
                                                                 resetDeps = []
                                                               }: UseBulkSelectionConfig<T, K>) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<K>>(new Set());
  /** 마지막으로 단일 클릭한 항목의 인덱스 (Shift 범위 선택의 앵커) */
  const anchorIndexRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    setSelectedKeys(new Set());
    anchorIndexRef.current = null;
  }, []);

  // 검색 조건 등이 바뀌면 선택을 초기화합니다.
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  /** 선택 가능한 항목의 키만 순서대로 추출 */
  const selectableKeys = useMemo(() => {
    const keys: K[] = [];
    items.forEach(item => {
      if (isSelectable && !isSelectable(item)) return;
      const key = getKey(item);
      if (key !== null && key !== undefined) keys.push(key as K);
    });
    return keys;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const notifyLimit = useCallback(() => {
    if (max) toast.info(`최대 ${max}개까지만 선택할 수 있습니다.`);
  }, [max]);

  /**
   * 항목 선택을 토글합니다.
   *
   * @param key   토글할 항목의 키
   * @param index 목록 내 인덱스 (Shift 범위 선택에 사용, 미지정 시 단일 토글)
   * @param event 클릭 이벤트 (shiftKey 판정에 사용)
   */
  const toggle = useCallback((
    key: K,
    index?: number,
    event?: {shiftKey?: boolean}
  ) => {
    const anchorIndex = anchorIndexRef.current;
    const isRangeSelect = Boolean(event?.shiftKey)
      && index !== undefined
      && anchorIndex !== null
      && anchorIndex !== index;

    if (isRangeSelect) {
      const from = Math.min(anchorIndex!, index!);
      const to = Math.max(anchorIndex!, index!);

      // 범위 내에서 선택 가능한 항목의 키만 수집
      const rangeKeys: K[] = [];
      items.slice(from, to + 1).forEach(item => {
        if (isSelectable && !isSelectable(item)) return;
        const itemKey = getKey(item);
        if (itemKey !== null && itemKey !== undefined) rangeKeys.push(itemKey as K);
      });

      setSelectedKeys(prev => {
        const next = new Set(prev);
        let reachedLimit = false;
        rangeKeys.forEach(rangeKey => {
          if (next.has(rangeKey)) return;
          if (max && next.size >= max) {
            reachedLimit = true;
            return;
          }
          next.add(rangeKey);
        });
        if (reachedLimit) notifyLimit();
        return next;
      });

      // 앵커는 유지하여 범위를 연속으로 조정할 수 있게 합니다.
      return;
    }

    if (index !== undefined) anchorIndexRef.current = index;

    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        return next;
      }
      if (max && next.size >= max) {
        notifyLimit();
        return prev;
      }
      next.add(key);
      return next;
    });
  }, [items, getKey, isSelectable, max, notifyLimit]);

  /** 현재 목록 전체를 선택합니다 (max까지). */
  const selectAll = useCallback(() => {
    const limited = max ? selectableKeys.slice(0, max) : selectableKeys;
    setSelectedKeys(new Set(limited));
    anchorIndexRef.current = null;
    if (max && selectableKeys.length > max) {
      toast.info(`최대 ${max}개까지만 선택되었습니다.`);
    }
  }, [selectableKeys, max]);

  const isSelected = useCallback((key: K) => selectedKeys.has(key), [selectedKeys]);

  const selectableCount = max
    ? Math.min(selectableKeys.length, max)
    : selectableKeys.length;

  const isAllSelected = selectableCount > 0 && selectedKeys.size >= selectableCount;
  const isPartiallySelected = selectedKeys.size > 0 && !isAllSelected;

  /** 전체 선택 체크박스용 토글 (선택된 것이 있으면 해제, 없으면 전체 선택) */
  const toggleAll = useCallback(() => {
    if (selectedKeys.size > 0) {
      clear();
    } else {
      selectAll();
    }
  }, [selectedKeys.size, clear, selectAll]);

  return {
    selectedKeys,
    /** 배열 형태의 선택 키 (API 호출용) */
    selectedList: useMemo(() => Array.from(selectedKeys), [selectedKeys]),
    selectedCount: selectedKeys.size,
    selectableCount,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggle,
    toggleAll,
    selectAll,
    clear,
    max
  };
};

export default useBulkSelection;
