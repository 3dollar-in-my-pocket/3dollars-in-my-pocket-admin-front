/**
 * 가게 이미지 타입 정의
 */

import {SimpleStore} from './store';
import {SimpleUser} from './user';

export type StoreImageStatus = 'ACTIVE' | 'INACTIVE';

/**
 * StoreImageResponse
 */
export interface StoreImage {
  imageId: number;
  url: string;
  status: StoreImageStatus;
  store?: SimpleStore;
  writer?: SimpleUser;
  createdAt?: string;
  updatedAt?: string;
}
