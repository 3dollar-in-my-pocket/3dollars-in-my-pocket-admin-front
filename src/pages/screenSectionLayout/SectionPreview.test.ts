import {describe, expect, it} from 'vitest';
import {toPreviewGapHeight} from './SectionPreview';

describe('toPreviewGapHeight', () => {
  it('여백이 0이면 간격을 그리지 않는다', () => {
    expect(toPreviewGapHeight(0)).toBe(0);
  });

  it('음수도 0과 동일하게 처리한다', () => {
    expect(toPreviewGapHeight(-10)).toBe(0);
  });

  // 8·16처럼 흔히 쓰는 작은 값이 0과 구분되어야 한다
  it('작은 값도 0과 구분되게 그린다', () => {
    expect(toPreviewGapHeight(1)).toBeGreaterThan(0);
    expect(toPreviewGapHeight(8)).toBeGreaterThan(toPreviewGapHeight(1));
  });

  it('값이 커질수록 간격도 커진다', () => {
    expect(toPreviewGapHeight(8)).toBeLessThan(toPreviewGapHeight(16));
    expect(toPreviewGapHeight(16)).toBeLessThan(toPreviewGapHeight(40));
  });

  it('큰 값은 상한을 넘지 않는다', () => {
    expect(toPreviewGapHeight(100)).toBeLessThanOrEqual(44);
    expect(toPreviewGapHeight(1000)).toBeLessThanOrEqual(44);
  });

  it('항상 정수를 반환한다', () => {
    [0, 1, 7, 8, 15, 33, 64, 100].forEach((value) => {
      expect(Number.isInteger(toPreviewGapHeight(value))).toBe(true);
    });
  });
});
