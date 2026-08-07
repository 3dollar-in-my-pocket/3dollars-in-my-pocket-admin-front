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

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/pushDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {getOsPlatformDisplayName} from '../utils/display/pushDisplay';

export interface PushRequest {
  accountIds: string[];
  accountType: string;
  title: string;
  body: string;
  path?: string;
  imageUrl?: string | null;
  targetOsPlatforms?: PushOsPlatform[];
}