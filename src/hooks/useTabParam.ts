import {useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';

const TAB_PARAM = 'tab';

/**
 * 선택한 탭을 URL 쿼리(?tab=)와 동기화합니다.
 * 허용되지 않은 값이면 첫 번째 탭을 사용하고, 첫 번째 탭은 쿼리에서 생략합니다.
 */
const useTabParam = <K extends string>(keys: readonly K[]): [K | undefined, (key: K) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(TAB_PARAM);
  const activeKey = keys.find(key => key === value) ?? keys[0];
  const defaultKey = keys[0];

  const setActiveKey = useCallback((key: K) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (key === defaultKey) {
        next.delete(TAB_PARAM);
      } else {
        next.set(TAB_PARAM, key);
      }
      return next;
    }, {replace: true});
  }, [defaultKey, setSearchParams]);

  return [activeKey, setActiveKey];
};

export default useTabParam;
