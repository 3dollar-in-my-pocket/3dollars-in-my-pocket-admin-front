/**
 * 여러 API 응답에서 공통으로 재사용되는 도메인 모델
 *
 * api-docs.json(OpenAPI)의 공용 스키마와 1:1로 대응합니다.
 * 특정 도메인에서만 쓰이는 필드는 이곳이 아니라 해당 도메인 타입 파일에 둡니다.
 */

import { ActivitiesStatus, StoreLabel, StoreStatus, StoreType } from './store';
import { SocialType, UserRole } from './user';
import { WriterType } from './common';

/** AddressResponse */
export interface Address {
  fullAddress?: string;
}

/** LocationResponse */
export interface Location {
  latitude: number;
  longitude: number;
}

/** ImageResponse */
export interface Image {
  imageUrl: string;
  width?: number;
  height?: number;
  ratio?: number;
}

/** DateTimeIntervalResponse */
export interface DateTimeInterval {
  startDateTime: string;
  endDateTime: string;
}

/** StoreFoodCategoryResponse */
export interface StoreFoodCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  classification?: any;
  isNew: boolean;
  displayOrder?: number;
}

/**
 * UserResponse — 작성자/방문자/신고자 등 응답에 포함되는 사용자 요약 정보
 *
 * 유저 검색 응답 모델은 types/user.ts의 User를 사용하세요. (별개 스키마)
 */
export interface SimpleUser {
  userId?: number;
  name: string;
  socialType?: SocialType;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

/** WriterResponse — 리뷰/게시물 작성 주체 */
export interface Writer {
  writerId: string;
  writerType: WriterType;
  name: string;
}

/** StoreSimpleResponse — 목록/이력 응답에 포함되는 가게 요약 정보 */
export interface SimpleStore {
  storeId: number;
  storeType: StoreType;
  name: string;
  rating: number;
  address: Address;
  categories: StoreFoodCategory[];
  status: StoreStatus;
  labels: StoreLabel[];
  activitiesStatus: ActivitiesStatus;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}
