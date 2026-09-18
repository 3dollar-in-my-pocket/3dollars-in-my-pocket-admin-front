import {describe, expect, it} from 'vitest';
import {toVisualHeight} from './SectionGap';

describe('toVisualHeight', () => {
  it('여백이 0이면 맞닿은 경계선만 남긴다', () => {
    expect(toVisualHeight(0)).toBe(2);
  });

  it('음수도 0과 동일하게 처리한다', () => {
    expect(toVisualHeight(-10)).toBe(2);
  });

  // 8·16처럼 흔히 쓰는 작은 값이 0과 구분되어야 한다
  it('작은 값도 0보다 뚜렷하게 크게 그린다', () => {
    expect(toVisualHeight(8)).toBeGreaterThan(10);
    expect(toVisualHeight(1)).toBeGreaterThan(10);
  });

  it('값이 커질수록 높이도 커진다', () => {
    expect(toVisualHeight(8)).toBeLessThan(toVisualHeight(16));
    expect(toVisualHeight(16)).toBeLessThan(toVisualHeight(40));
  });

  it('큰 값은 상한을 넘지 않는다', () => {
    expect(toVisualHeight(100)).toBeLessThanOrEqual(72);
    expect(toVisualHeight(1000)).toBeLessThanOrEqual(72);
  });

  it('항상 정수를 반환한다', () => {
    [0, 1, 7, 8, 15, 33, 64, 100].forEach((value) => {
      expect(Number.isInteger(toVisualHeight(value))).toBe(true);
    });
  });
});
