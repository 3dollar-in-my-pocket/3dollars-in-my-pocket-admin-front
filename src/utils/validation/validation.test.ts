import {describe, expect, it} from 'vitest';
import {STORE_SEARCH_TYPES} from '@/types/store';
import {SEARCH_TYPES} from '@/types/user';
import {validateStoreSearch} from './storeValidation';
import {formatUserIds, validateUserSearch} from './userValidation';

describe('validateStoreSearch', () => {
  describe('가게 ID 검색', () => {
    const validate = (keyword: string) =>
      validateStoreSearch(STORE_SEARCH_TYPES.STORE_ID, keyword);

    it('단일 ID는 통과한다', () => {
      expect(validate('123')).toBeNull();
    });

    it('쉼표로 구분된 여러 ID는 통과한다', () => {
      expect(validate('1, 2, 3')).toBeNull();
    });

    it('비어 있으면 입력을 요구한다', () => {
      expect(validate('')).toBe('가게 ID를 입력해주세요.');
      expect(validate('   ')).toBe('가게 ID를 입력해주세요.');
    });

    it('쉼표만 있으면 입력을 요구한다', () => {
      expect(validate(', ,')).toBe('가게 ID를 입력해주세요.');
    });

    // 경계값: 5개까지 허용, 6개부터 거부
    it('5개까지는 통과한다', () => {
      expect(validate('1,2,3,4,5')).toBeNull();
    });

    it('5개를 넘으면 거부한다', () => {
      expect(validate('1,2,3,4,5,6')).toBe('최대 5개의 가게 ID만 입력 가능합니다.');
    });

    it('숫자가 아닌 ID는 거부한다', () => {
      expect(validate('abc')).toBe('가게 ID는 숫자만 입력 가능합니다.');
      expect(validate('1,2,x')).toBe('가게 ID는 숫자만 입력 가능합니다.');
    });

    it('음수와 소수는 숫자로 보지 않는다', () => {
      expect(validate('-1')).toBe('가게 ID는 숫자만 입력 가능합니다.');
      expect(validate('1.5')).toBe('가게 ID는 숫자만 입력 가능합니다.');
    });
  });

  describe('가게 ID 외 검색', () => {
    it('키워드 검색은 검증하지 않는다', () => {
      expect(validateStoreSearch(STORE_SEARCH_TYPES.KEYWORD, '')).toBeNull();
      expect(validateStoreSearch(STORE_SEARCH_TYPES.KEYWORD, '떡볶이')).toBeNull();
    });

    it('최신순 조회는 검증하지 않는다', () => {
      expect(validateStoreSearch(STORE_SEARCH_TYPES.RECENT, '')).toBeNull();
    });
  });
});

describe('formatUserIds', () => {
  it('쉼표로 구분된 문자열을 숫자 배열로 만든다', () => {
    expect(formatUserIds('1, 2 ,3')).toEqual([1, 2, 3]);
  });

  it('숫자가 아닌 항목은 걸러낸다', () => {
    expect(formatUserIds('1,abc,3')).toEqual([1, 3]);
  });

  it('빈 문자열이면 빈 배열을 반환한다', () => {
    expect(formatUserIds('')).toEqual([]);
    expect(formatUserIds('   ')).toEqual([]);
  });

  // parseInt는 숫자로 시작하면 뒤를 무시하므로 현재 동작을 기록한다
  it('숫자로 시작하는 값은 앞부분을 숫자로 읽는다', () => {
    expect(formatUserIds('12abc')).toEqual([12]);
  });
});

describe('validateUserSearch', () => {
  describe('이름 검색', () => {
    it('검색어가 있으면 통과한다', () => {
      expect(validateUserSearch(SEARCH_TYPES.NAME, '홍길동', '')).toBeNull();
    });

    it('검색어가 없으면 입력을 요구한다', () => {
      expect(validateUserSearch(SEARCH_TYPES.NAME, '', '')).toBe('검색어를 입력해주세요.');
      expect(validateUserSearch(SEARCH_TYPES.NAME, '   ', '')).toBe('검색어를 입력해주세요.');
    });
  });

  describe('유저 ID 검색', () => {
    const validate = (userIds: string) =>
      validateUserSearch(SEARCH_TYPES.USER_ID, '', userIds);

    it('ID가 있으면 통과한다', () => {
      expect(validate('1, 2, 3')).toBeNull();
    });

    it('ID가 없으면 입력을 요구한다', () => {
      expect(validate('')).toBe('유저 ID를 입력해주세요.');
      expect(validate('abc')).toBe('유저 ID를 입력해주세요.');
    });

    // 경계값: 50개까지 허용, 51개부터 거부
    it('50개까지는 통과한다', () => {
      const ids = Array.from({length: 50}, (_, i) => i + 1).join(',');
      expect(validate(ids)).toBeNull();
    });

    it('50개를 넘으면 거부한다', () => {
      const ids = Array.from({length: 51}, (_, i) => i + 1).join(',');
      expect(validate(ids)).toBe('유저 ID는 최대 50개까지 조회 가능합니다.');
    });

    it('유저 ID 검색에서는 검색어를 요구하지 않는다', () => {
      expect(validate('1')).toBeNull();
    });
  });
});
