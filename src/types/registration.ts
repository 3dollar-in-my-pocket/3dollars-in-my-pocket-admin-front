// Registration related type definitions

// OS Platform types
export const OS_PLATFORM = {
  AOS: 'AOS',
  IOS: 'IOS',
  UNKNOWN: 'UNKNOWN'
} as const;

export type OsPlatform = typeof OS_PLATFORM[keyof typeof OS_PLATFORM];

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/registrationDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {
  getOsPlatformDisplayName,
  getOsPlatformBadgeClass,
  getOsPlatformIcon
} from '../utils/display/registrationDisplay';
