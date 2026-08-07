/**
 * 푸시 발송 대상 OS 표시 로직 (라벨)
 *
 * 타입과 상수 정의는 types/push.ts에 있습니다.
 */

import { PUSH_OS_PLATFORM, PushOsPlatform } from '../../types/push';

export const getOsPlatformDisplayName = (platform: PushOsPlatform): string => {
  switch (platform) {
    case PUSH_OS_PLATFORM.AOS:
      return '안드로이드';
    case PUSH_OS_PLATFORM.IOS:
      return 'iOS';
    default:
      return '알 수 없음';
  }
};
