/**
 * OS 플랫폼 표시 로직 (라벨, 배지 클래스, 아이콘)
 *
 * 디바이스 목록, 가입 신청, 푸시 발송 대상이 모두 같은 OS 코드를 사용합니다.
 * 타입과 상수 정의는 types/device.ts에 있습니다.
 */

import { OS_PLATFORM, OsPlatform } from '../../types/device';

export const getOsPlatformDisplayName = (osPlatform: OsPlatform): string => {
  switch (osPlatform) {
    case OS_PLATFORM.AOS:
      return 'Android';
    case OS_PLATFORM.IOS:
      return 'iOS';
    default:
      return '알 수 없음';
  }
};

export const getOsPlatformBadgeClass = (osPlatform: OsPlatform): string => {
  switch (osPlatform) {
    case OS_PLATFORM.AOS:
      return 'bg-success';
    case OS_PLATFORM.IOS:
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
};

export const getOsPlatformIcon = (osPlatform: OsPlatform): string => {
  switch (osPlatform) {
    case OS_PLATFORM.AOS:
      return 'bi-android2';
    case OS_PLATFORM.IOS:
      return 'bi-apple';
    default:
      return 'bi-question-circle';
  }
};
