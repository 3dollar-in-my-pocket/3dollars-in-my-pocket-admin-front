export interface Device {
  deviceId: string;
  os: 'AOS' | 'IOS' | 'UNKNOWN';
  appVersion: string;
  pushToken?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEVICE_OS = {
  IOS: 'IOS',
  AOS: 'ANDROID', // API에서 AOS로 오는 경우 Android로 매핑
  UNKNOWN: 'UNKNOWN'
};

/**
 * 하위 호환용 re-export
 *
 * 표시 로직은 utils/display/deviceDisplay.ts로 옮겼습니다.
 * 새 코드는 원본 경로에서 직접 import하세요.
 */
export {getOsBadgeClass} from '../utils/display/deviceDisplay';
