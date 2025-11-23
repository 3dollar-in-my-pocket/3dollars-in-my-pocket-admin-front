// Registration related type definitions

// OS Platform types
export const OS_PLATFORM = {
  AOS: 'AOS',
  IOS: 'IOS',
  UNKNOWN: 'UNKNOWN'
} as const;

export type OsPlatform = typeof OS_PLATFORM[keyof typeof OS_PLATFORM];

// Utility functions
export const getOsPlatformDisplayName = (osPlatform: OsPlatform): string => {
  switch (osPlatform) {
    case OS_PLATFORM.AOS:
      return 'Android';
    case OS_PLATFORM.IOS:
      return 'iOS';
    case OS_PLATFORM.UNKNOWN:
      return '알 수 없음';
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
    case OS_PLATFORM.UNKNOWN:
      return 'bg-secondary';
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
    case OS_PLATFORM.UNKNOWN:
      return 'bi-question-circle';
    default:
      return 'bi-question-circle';
  }
};
