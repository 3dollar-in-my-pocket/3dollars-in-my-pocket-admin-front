/**
 * 여러 API 응답에서 공통으로 재사용되는 도메인 모델
 *
 * api-docs.json(OpenAPI)의 공용 스키마와 1:1로 대응합니다.
 * 특정 도메인에서만 쓰이는 필드는 이곳이 아니라 해당 도메인 타입 파일에 둡니다.
 */

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

export type SocialType = 'KAKAO' | 'APPLE' | 'GOOGLE' | 'NAVER';
export type UserRole = 'MEMBER' | 'MANAGER';

/** UserResponse — 작성자/방문자/신고자 등 사용자 요약 정보 */
export interface User {
  userId?: number;
  name: string;
  socialType?: SocialType;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type WriterType = 'STORE' | 'USER';

/** WriterResponse — 리뷰/게시물 작성 주체 */
export interface Writer {
  writerId: string;
  writerType: WriterType;
  name: string;
}

export type StoreTypeCode = 'USER_STORE' | 'BOSS_STORE';
export type StoreStatus = 'ACTIVE' | 'DELETED' | 'AUTO_DELETED';
export type ActivitiesStatus = 'RECENT_ACTIVITY' | 'NO_RECENT_ACTIVITY';

/** StoreSimpleResponse — 목록/이력 응답에 포함되는 가게 요약 정보 */
export interface SimpleStore {
  storeId: number;
  storeType: StoreTypeCode;
  name: string;
  rating: number;
  address: Address;
  categories: StoreFoodCategory[];
  status: StoreStatus;
  labels: string[];
  activitiesStatus: ActivitiesStatus;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}
