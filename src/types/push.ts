/**
 * 푸시 발송 대상 OS
 *
 * 가입 신청 등에서 표시하는 기기 OS(UNKNOWN 포함)는 types/registration.ts의
 * OsPlatform을 사용하세요. 발송 대상에는 UNKNOWN이 없습니다.
 */
export type PushOsPlatform = 'AOS' | 'IOS';

export const PUSH_OS_PLATFORM = {
  AOS: 'AOS' as PushOsPlatform,
  IOS: 'IOS' as PushOsPlatform
} as const;

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

export interface PushRequest {
  accountIds: string[];
  accountType: string;
  title: string;
  body: string;
  path?: string;
  imageUrl?: string | null;
  targetOsPlatforms?: PushOsPlatform[];
}