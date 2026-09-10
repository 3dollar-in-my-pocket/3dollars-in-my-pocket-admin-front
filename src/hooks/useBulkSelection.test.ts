import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import useBulkSelection from './useBulkSelection';

vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

import {toast} from 'react-toastify';

interface Item {
  id: number;
  deleted?: boolean;
}

const items = (...ids: number[]): Item[] => ids.map(id => ({id}));

/** 호출부와 동일하게 getKey를 인라인 함수로 넘겨 참조가 매 렌더링 바뀌는 상황을 재현합니다. */
const renderBulkSelection = (initialItems: Item[], options: {
  max?: number;
  isSelectable?: (item: Item) => boolean;
} = {}) =>
  renderHook(
    ({list}: {list: Item[]}) => useBulkSelection<Item, number>({
      items: list,
      getKey: item => item.id,
      max: options.max,
      isSelectable: options.isSelectable,
    }),
    {initialProps: {list: initialItems}}
  );

describe('useBulkSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태는 아무것도 선택되지 않는다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3));

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedList).toEqual([]);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isPartiallySelected).toBe(false);
    expect(result.current.selectableCount).toBe(3);
  });

  it('toggle로 선택과 해제를 반복할 수 있다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3));

    act(() => result.current.toggle(2));
    expect(result.current.isSelected(2)).toBe(true);
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.toggle(2));
    expect(result.current.isSelected(2)).toBe(false);
    expect(result.current.selectedCount).toBe(0);
  });

  it('일부만 선택하면 isPartiallySelected가 true가 된다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3));

    act(() => result.current.toggle(1));

    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isPartiallySelected).toBe(true);
  });

  it('현재 목록을 모두 선택하면 isAllSelected가 true가 된다', () => {
    const {result} = renderBulkSelection(items(1, 2));

    act(() => result.current.selectAll());

    expect(result.current.isAllSelected).toBe(true);
    expect(result.current.isPartiallySelected).toBe(false);
    expect(result.current.selectedList).toEqual([1, 2]);
  });

  // 회귀 테스트: 선택 개수만 비교하면 전체 선택으로 오판정되던 버그
  it('선택 개수가 같아도 현재 목록의 항목이 아니면 전체 선택이 아니다', () => {
    const {result, rerender} = renderBulkSelection(items(1, 2));

    act(() => result.current.selectAll());
    expect(result.current.isAllSelected).toBe(true);

    // 목록이 다른 항목으로 교체되면 선택 개수(2)는 같지만 전체 선택이 아니다.
    rerender({list: items(3, 4)});

    expect(result.current.selectedCount).toBe(2);
    expect(result.current.selectableCount).toBe(2);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isPartiallySelected).toBe(true);
  });

  it('선택 불가 항목은 selectAll에서 제외된다', () => {
    const list: Item[] = [{id: 1}, {id: 2, deleted: true}, {id: 3}];
    const {result} = renderBulkSelection(list, {
      isSelectable: item => !item.deleted,
    });

    expect(result.current.selectableCount).toBe(2);

    act(() => result.current.selectAll());

    expect(result.current.selectedList).toEqual([1, 3]);
    expect(result.current.isAllSelected).toBe(true);
  });

  it('max를 넘겨 선택하려 하면 차단하고 안내한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3), {max: 2});

    act(() => result.current.toggle(1));
    act(() => result.current.toggle(2));
    act(() => result.current.toggle(3));

    expect(result.current.selectedCount).toBe(2);
    expect(result.current.isSelected(3)).toBe(false);
    expect(toast.info).toHaveBeenCalledWith('최대 2개까지만 선택할 수 있습니다.');
  });

  it('max가 있으면 selectAll은 앞에서부터 max개만 선택한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3, 4), {max: 2});

    act(() => result.current.selectAll());

    expect(result.current.selectedList).toEqual([1, 2]);
    expect(result.current.isAllSelected).toBe(true);
    expect(toast.info).toHaveBeenCalledWith('최대 2개까지만 선택되었습니다.');
  });

  it('Shift + 클릭으로 앵커부터 현재 항목까지 범위 선택한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3, 4, 5));

    // 앵커 지정 (인덱스 1 = id 2)
    act(() => result.current.toggle(2, 1));
    // 인덱스 3 (id 4)까지 범위 선택
    act(() => result.current.toggle(4, 3, {shiftKey: true}));

    expect(result.current.selectedList).toEqual([2, 3, 4]);
  });

  it('Shift + 클릭 범위 선택은 역방향도 동작한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3, 4, 5));

    act(() => result.current.toggle(4, 3));
    act(() => result.current.toggle(2, 1, {shiftKey: true}));

    expect(result.current.selectedList.sort()).toEqual([2, 3, 4]);
  });

  it('Shift + 클릭 범위 선택도 선택 불가 항목을 건너뛴다', () => {
    const list: Item[] = [{id: 1}, {id: 2, deleted: true}, {id: 3}];
    const {result} = renderBulkSelection(list, {
      isSelectable: item => !item.deleted,
    });

    act(() => result.current.toggle(1, 0));
    act(() => result.current.toggle(3, 2, {shiftKey: true}));

    expect(result.current.selectedList).toEqual([1, 3]);
  });

  it('앵커가 없으면 Shift + 클릭은 단일 토글로 동작한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3));

    act(() => result.current.toggle(3, 2, {shiftKey: true}));

    expect(result.current.selectedList).toEqual([3]);
  });

  it('clear는 선택과 앵커를 모두 초기화한다', () => {
    const {result} = renderBulkSelection(items(1, 2, 3));

    act(() => result.current.toggle(1, 0));
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);

    // 앵커가 초기화되어 범위 선택이 단일 토글로 동작한다.
    act(() => result.current.toggle(3, 2, {shiftKey: true}));
    expect(result.current.selectedList).toEqual([3]);
  });

  it('toggleAll은 선택된 항목이 있으면 해제하고 없으면 전체 선택한다', () => {
    const {result} = renderBulkSelection(items(1, 2));

    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(2);

    act(() => result.current.toggleAll());
    expect(result.current.selectedCount).toBe(0);
  });

  it('선택 가능한 항목이 없으면 전체 선택 상태가 아니다', () => {
    const {result} = renderBulkSelection([], {});

    expect(result.current.selectableCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
  });

  it('더보기로 목록이 늘어나면 기존 선택은 유지된다', () => {
    const {result, rerender} = renderBulkSelection(items(1, 2));

    act(() => result.current.selectAll());
    expect(result.current.isAllSelected).toBe(true);

    rerender({list: items(1, 2, 3, 4)});

    expect(result.current.selectedList).toEqual([1, 2]);
    // 새로 추가된 항목은 선택되지 않았으므로 전체 선택이 아니다.
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isPartiallySelected).toBe(true);
  });
});
