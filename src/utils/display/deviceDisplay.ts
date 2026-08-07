/**
 * 디바이스 OS 표시 로직 (배지 클래스)
 *
 * 타입과 상수 정의는 types/device.ts에 있습니다.
 */

import { DEVICE_OS } from '../../types/device';

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
