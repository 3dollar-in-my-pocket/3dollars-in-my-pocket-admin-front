/**
 * 가게 이미지 타입 정의
 */

// 가게 이미지 기본 정보
export interface StoreImage {
  imageId: string;
  url: string;
  createdAt: string;
  writer?: {
    writerId: string;
    name: string;
  };
}

// 사용자별 가게 이미지 (스토어 정보 포함)
export interface UserStoreImage extends StoreImage {
  store?: {
    storeId: string;
    name: string;
  };
}
