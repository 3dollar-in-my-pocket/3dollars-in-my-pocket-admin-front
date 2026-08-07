/**
 * 디바이스 / OS 플랫폼 타입 정의
 */

/** DeviceResponse.osPlatform */
export const OS_PLATFORM = {
  AOS: 'AOS',
  IOS: 'IOS',
  UNKNOWN: 'UNKNOWN'
} as const;

export type OsPlatform = typeof OS_PLATFORM[keyof typeof OS_PLATFORM];

/** 푸시 발송 대상 OS (UNKNOWN 기기에는 발송하지 않습니다) */
export type PushOsPlatform = Exclude<OsPlatform, 'UNKNOWN'>;

export const PUSH_OS_PLATFORM = {
  AOS: OS_PLATFORM.AOS,
  IOS: OS_PLATFORM.IOS
} as const;

/** DeviceResponse */
export interface Device {
  deviceId: string;
  osPlatform: OsPlatform;
  appVersion?: string;
  pushToken: string;
  createdAt?: string;
  updatedAt?: string;
}
