import {describe, expect, it} from 'vitest';
import {AxiosResponse} from 'axios';
import {NONCE_HEADER, PAGINATION_DEFAULTS} from '@/constants/api';
import {
  buildArrayParam,
  buildCursorParams,
  buildIncludesParam,
  buildNonceHeader,
  normalizeCursorResponse,
  unwrapApiResponse
} from './apiUtils';

/** 서버 응답 본문만 지정해 AxiosResponse 형태로 감쌉니다. */
const axiosResponse = (data: any): AxiosResponse => ({data} as AxiosResponse);

describe('buildCursorParams', () => {
  it('커서가 없으면 size만 담는다', () => {
    expect(buildCursorParams()).toEqual({size: PAGINATION_DEFAULTS.CURSOR_SIZE});
  });

  it('커서가 있으면 함께 담는다', () => {
    expect(buildCursorParams('abc', 20)).toEqual({size: 20, cursor: 'abc'});
  });

  it('null 커서는 담지 않는다', () => {
    expect(buildCursorParams(null, 10)).toEqual({size: 10});
  });

  // 빈 문자열 커서를 넘기면 첫 페이지로 취급한다
  it('빈 문자열 커서는 담지 않는다', () => {
    expect(buildCursorParams('', 10)).toEqual({size: 10});
  });
});

describe('buildIncludesParam', () => {
  it('단일 값은 그대로 반환한다', () => {
    expect(buildIncludesParam('WRITER')).toBe('WRITER');
  });

  it('배열은 쉼표로 이어 붙인다', () => {
    expect(buildIncludesParam(['WRITER', 'STORE'])).toBe('WRITER,STORE');
  });

  it('값이 없으면 undefined를 반환한다', () => {
    expect(buildIncludesParam()).toBeUndefined();
    expect(buildIncludesParam(undefined)).toBeUndefined();
  });

  // 빈 배열은 파라미터를 보내지 않는 것이 의도지만 현재는 빈 문자열이 된다
  it('빈 배열은 빈 문자열을 반환한다', () => {
    expect(buildIncludesParam([])).toBe('');
  });
});

describe('buildNonceHeader', () => {
  it('nonce가 있으면 헤더를 만든다', () => {
    expect(buildNonceHeader('n-1')).toEqual({[NONCE_HEADER]: 'n-1'});
  });

  it('nonce가 없으면 빈 객체를 반환한다', () => {
    expect(buildNonceHeader()).toEqual({});
    expect(buildNonceHeader('')).toEqual({});
  });
});

describe('buildArrayParam', () => {
  it('문자열 배열을 쉼표로 이어 붙인다', () => {
    expect(buildArrayParam(['USER_STORE', 'BOSS_STORE'])).toBe('USER_STORE,BOSS_STORE');
  });

  it('숫자 배열도 이어 붙인다', () => {
    expect(buildArrayParam([1, 2, 3])).toBe('1,2,3');
  });

  it('빈 배열이면 undefined를 반환한다', () => {
    expect(buildArrayParam([])).toBeUndefined();
  });

  it('null이나 undefined면 undefined를 반환한다', () => {
    expect(buildArrayParam(null)).toBeUndefined();
    expect(buildArrayParam()).toBeUndefined();
  });
});

describe('unwrapApiResponse', () => {
  it('ok면 data를 꺼내 반환한다', () => {
    const result = unwrapApiResponse<{id: number}>(
      axiosResponse({ok: true, data: {id: 1}})
    );

    expect(result).toEqual({ok: true, data: {id: 1}});
  });

  it('ok가 아니면 서버 메시지로 예외를 던진다', () => {
    expect(() => unwrapApiResponse(
      axiosResponse({ok: false, message: '권한이 없습니다.'})
    )).toThrow('권한이 없습니다.');
  });

  it('메시지가 없으면 기본 문구로 예외를 던진다', () => {
    expect(() => unwrapApiResponse(axiosResponse({ok: false})))
      .toThrow('API 응답 오류');
  });
});

describe('normalizeCursorResponse', () => {
  it('서버 응답을 표준 형태로 변환한다', () => {
    const result = normalizeCursorResponse<{id: number}>({
      contents: [{id: 1}],
      cursor: {hasMore: true, nextCursor: 'c1'}
    });

    expect(result).toEqual({
      contents: [{id: 1}],
      cursor: {hasMore: true, nextCursor: 'c1'}
    });
  });

  it('totalCount가 있으면 포함한다', () => {
    const result = normalizeCursorResponse({
      contents: [],
      cursor: {hasMore: false, nextCursor: null, totalCount: 42}
    });

    expect(result.cursor.totalCount).toBe(42);
  });

  it('totalCount가 없으면 키를 만들지 않는다', () => {
    const result = normalizeCursorResponse({
      contents: [],
      cursor: {hasMore: false}
    });

    expect('totalCount' in result.cursor).toBe(false);
  });

  it('totalCount가 0이어도 포함한다', () => {
    const result = normalizeCursorResponse({
      contents: [],
      cursor: {hasMore: false, totalCount: 0}
    });

    expect(result.cursor.totalCount).toBe(0);
  });

  describe('응답이 불완전한 경우', () => {
    it('contents가 없으면 빈 배열로 채운다', () => {
      const result = normalizeCursorResponse({cursor: {hasMore: false}});

      expect(result.contents).toEqual([]);
    });

    it('cursor가 없으면 더 없음으로 처리한다', () => {
      const result = normalizeCursorResponse({contents: [{id: 1}]});

      expect(result.cursor).toEqual({hasMore: false, nextCursor: null});
    });

    it('data가 null이어도 안전하게 처리한다', () => {
      const result = normalizeCursorResponse(null);

      expect(result).toEqual({
        contents: [],
        cursor: {hasMore: false, nextCursor: null}
      });
    });
  });
});
