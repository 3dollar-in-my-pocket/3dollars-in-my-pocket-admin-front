import {describe, expect, it} from 'vitest';
import {formatDistance, formatDistanceBetween, getDistanceMeters} from './geoUtils';

describe('getDistanceMeters', () => {
  it('같은 좌표는 0m', () => {
    expect(getDistanceMeters({latitude: 37.5, longitude: 127}, {latitude: 37.5, longitude: 127})).toBe(0);
  });

  it('서울시청-강남역 거리를 약 8.8km로 계산한다', () => {
    const meters = getDistanceMeters({latitude: 37.5663, longitude: 126.9779}, {latitude: 37.4979, longitude: 127.0276});
    expect(meters).toBeGreaterThan(8500);
    expect(meters).toBeLessThan(9100);
  });
});

describe('formatDistance', () => {
  it('1m 미만은 같은 위치로 표시한다', () => {
    expect(formatDistance(0)).toBe('같은 위치');
    expect(formatDistance(0.4)).toBe('같은 위치');
  });

  it('1km 미만은 m 단위 정수로 표시한다', () => {
    expect(formatDistance(123.6)).toBe('124m');
  });

  it('1km 이상은 km 단위 소수 첫째 자리로 표시한다', () => {
    expect(formatDistance(1234)).toBe('1.2km');
  });
});

describe('formatDistanceBetween', () => {
  it('좌표가 없으면 null', () => {
    expect(formatDistanceBetween(undefined, {latitude: 37.5, longitude: 127})).toBeNull();
  });
});
