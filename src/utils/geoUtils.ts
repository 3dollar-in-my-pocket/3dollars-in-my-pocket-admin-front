import {Location} from '@/types/domain';

const EARTH_RADIUS_METERS = 6_371_000;

const toRadians = (degree: number) => (degree * Math.PI) / 180;

/** 두 좌표 사이의 직선 거리(m)를 하버사인 공식으로 계산합니다. */
export const getDistanceMeters = (from: Location, to: Location): number => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
};

/** 이 거리 미만이면 같은 위치로 봅니다. 중복 제보 가게는 좌표가 완전히 같은 경우가 많습니다. */
const SAME_LOCATION_THRESHOLD_METERS = 1;

/** 거리를 1m 미만은 '같은 위치', 1km 미만은 m, 이상은 소수 첫째 자리 km로 표시합니다. */
export const formatDistance = (meters: number): string => {
  if (meters < SAME_LOCATION_THRESHOLD_METERS) return '같은 위치';
  return meters < 1000 ? `${Math.round(meters)}m` : `${(meters / 1000).toFixed(1)}km`;
};

/** 두 좌표 중 하나라도 없으면 null을 반환합니다. */
export const formatDistanceBetween = (from?: Location | null, to?: Location | null): string | null =>
  from && to ? formatDistance(getDistanceMeters(from, to)) : null;
