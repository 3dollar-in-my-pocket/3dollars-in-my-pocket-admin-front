import {describe, expect, it} from 'vitest';
import {formatCount, formatRating} from './formatUtils';

describe('formatRating', () => {
  it('평점을 소수 첫째 자리까지 표시한다', () => {
    expect(formatRating(4.5)).toBe('4.5점');
  });

  it('정수 평점도 소수 첫째 자리를 붙인다', () => {
    expect(formatRating(5)).toBe('5.0점');
  });

  it('소수 둘째 자리는 반올림한다', () => {
    expect(formatRating(4.26)).toBe('4.3점');
  });

  it('0점이면 리뷰 없음으로 안내한다', () => {
    expect(formatRating(0)).toBe('아직 리뷰가 없어요');
  });

  it('값이 없으면 리뷰 없음으로 안내한다', () => {
    expect(formatRating(undefined)).toBe('아직 리뷰가 없어요');
  });

  it('음수도 리뷰 없음으로 안내한다', () => {
    expect(formatRating(-1)).toBe('아직 리뷰가 없어요');
  });
});

describe('formatCount', () => {
  it('1000 미만은 천 단위 구분자로 표시한다', () => {
    expect(formatCount(999)).toBe('999');
    expect(formatCount(0)).toBe('0');
  });

  // 경계값: 1000부터 k 단위로 축약한다
  it('1000이면 k 단위로 축약한다', () => {
    expect(formatCount(1000)).toBe('1.0k');
  });

  it('1000 이상은 소수 첫째 자리까지 축약한다', () => {
    expect(formatCount(1500)).toBe('1.5k');
    expect(formatCount(12345)).toBe('12.3k');
  });

  it('100만 단위도 k로 표시한다', () => {
    expect(formatCount(1_000_000)).toBe('1000.0k');
  });
});
