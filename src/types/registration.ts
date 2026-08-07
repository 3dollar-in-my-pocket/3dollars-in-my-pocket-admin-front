// Registration related type definitions

// OS Platform types
export const OS_PLATFORM = {
  AOS: 'AOS',
  IOS: 'IOS',
  UNKNOWN: 'UNKNOWN'
} as const;

export type OsPlatform = typeof OS_PLATFORM[keyof typeof OS_PLATFORM];
