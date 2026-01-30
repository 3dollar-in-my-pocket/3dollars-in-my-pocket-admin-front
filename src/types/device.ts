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

export const getOsBadgeClass = (os: string) => {
  switch (os) {
    case DEVICE_OS.IOS:
      return 'bg-primary';
    case DEVICE_OS.AOS:
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};
