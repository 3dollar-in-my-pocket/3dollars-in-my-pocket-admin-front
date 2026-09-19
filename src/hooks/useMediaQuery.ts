import {useEffect, useState} from 'react';

/**
 * CSS 미디어 쿼리의 일치 여부를 구독합니다.
 *
 * 레이아웃 자체는 CSS로 처리하는 것이 원칙이지만, 화면 폭에 따라 마크업이나 기본
 * 상태가 달라져야 하는 경우(예: 모바일에서만 접어두기)에는 JS에서도 판정이 필요합니다.
 *
 * @param query `(max-width: 991.98px)` 같은 미디어 쿼리 문자열
 */
export const useMediaQuery = (query: string): boolean => {
  // SSR이나 테스트 환경처럼 matchMedia가 없을 수 있어 방어합니다.
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    // query가 바뀐 직후의 값도 즉시 반영합니다.
    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

/** Bootstrap lg 미만. 미리보기와 편집 목록이 2단으로 나뉘지 않는 구간입니다. */
export const MOBILE_QUERY = '(max-width: 991.98px)';

export default useMediaQuery;
