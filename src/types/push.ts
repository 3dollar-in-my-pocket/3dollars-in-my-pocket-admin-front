export type OsPlatform = 'AOS' | 'IOS';

export const OS_PLATFORM = {
  AOS: 'AOS' as OsPlatform,
  IOS: 'IOS' as OsPlatform
} as const;

export const getOsPlatformDisplayName = (platform: OsPlatform): string => {
  switch (platform) {
    case OS_PLATFORM.AOS:
      return '안드로이드';
    case OS_PLATFORM.IOS:
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
  targetOsPlatforms?: OsPlatform[];
}