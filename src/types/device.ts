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
