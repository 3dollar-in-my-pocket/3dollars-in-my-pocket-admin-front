import {act, renderHook} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import useMediaQuery from './useMediaQuery';

type Listener = (event: MediaQueryListEvent) => void;

/**
 * matchMedia를 흉내 냅니다.
 *
 * jsdom에는 matchMedia 구현이 없어 훅을 그대로 렌더링하면 바로 터집니다.
 * 반환된 setMatches로 화면 폭이 바뀌는 상황을 재현합니다.
 */
const stubMatchMedia = (initialMatches: boolean) => {
  const listeners = new Set<Listener>();
  let matches = initialMatches;

  const matchMedia = vi.fn((query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, listener: Listener) => listeners.add(listener),
    removeEventListener: (_: string, listener: Listener) => listeners.delete(listener),
  }));

  vi.stubGlobal('matchMedia', matchMedia);

  return {
    matchMedia,
    listenerCount: () => listeners.size,
    setMatches: (next: boolean) => {
      matches = next;
      listeners.forEach((listener) => listener({matches: next} as MediaQueryListEvent));
    },
  };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMediaQuery', () => {
  it('초기 일치 여부를 반환한다', () => {
    stubMatchMedia(true);

    const {result} = renderHook(() => useMediaQuery('(max-width: 991.98px)'));

    expect(result.current).toBe(true);
  });

  it('일치하지 않으면 false를 반환한다', () => {
    stubMatchMedia(false);

    const {result} = renderHook(() => useMediaQuery('(max-width: 991.98px)'));

    expect(result.current).toBe(false);
  });

  it('화면 폭이 바뀌면 값을 갱신한다', () => {
    const media = stubMatchMedia(false);

    const {result} = renderHook(() => useMediaQuery('(max-width: 991.98px)'));
    expect(result.current).toBe(false);

    act(() => media.setMatches(true));

    expect(result.current).toBe(true);
  });

  it('언마운트 시 리스너를 해제한다', () => {
    const media = stubMatchMedia(false);

    const {unmount} = renderHook(() => useMediaQuery('(max-width: 991.98px)'));
    expect(media.listenerCount()).toBe(1);

    unmount();

    expect(media.listenerCount()).toBe(0);
  });

  // matchMedia가 없는 환경에서도 렌더링 자체는 실패하지 않아야 한다
  it('matchMedia가 없으면 false로 동작한다', () => {
    vi.stubGlobal('matchMedia', undefined);

    const {result} = renderHook(() => useMediaQuery('(max-width: 991.98px)'));

    expect(result.current).toBe(false);
  });
});
