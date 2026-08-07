/**
 * 가게 이미지 타입 정의
 */

import { SimpleStore, User } from './domain';

export type StoreImageStatus = 'ACTIVE' | 'INACTIVE';

/**
 * StoreImageResponse
 *
 * 가게별(GET /v1/store/{storeId}/images), 사용자별
 * (GET /v1/user/{userId}/store-images), 전체(GET /v1/store-images)
 * 이미지 목록이 모두 동일하게 사용합니다.
 */
export interface StoreImage {
  imageId: number;
  url: string;
  status: StoreImageStatus;
  store?: SimpleStore;
  writer?: User;
  createdAt?: string;
  updatedAt?: string;
}

/** 응답 스키마가 StoreImage와 동일합니다. */
export type UserStoreImage = StoreImage;
