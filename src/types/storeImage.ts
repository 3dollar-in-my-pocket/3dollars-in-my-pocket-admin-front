/**
 * 가게 이미지 타입 정의
 */

// 가게 카테고리 정보
export interface StoreCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  classification: {
    type: string;
    description: string;
    priority: number;
  };
  isNew: boolean;
  displayOrder: number;
}

// 가게 주소 정보
export interface StoreAddress {
  fullAddress: string;
}

// 가게 위치 정보
export interface StoreLocation {
  latitude: number;
  longitude: number;
}

// 가게 정보
export interface Store {
  storeId: number;
  storeType: string;
  name: string;
  rating: number;
  location: StoreLocation;
  address: StoreAddress;
  categories: StoreCategory[];
  status: string;
  labels: any[];
  activitiesStatus: string;
  createdAt: string;
  updatedAt: string;
}

// 작성자 정보
export interface Writer {
  userId: number;
  name: string;
  socialType: string;
  createdAt: string;
  updatedAt: string;
}

// 가게 이미지 기본 정보 (관리자용 - 스토어와 작성자 정보 포함)
export interface StoreImage {
  imageId: number;
  url: string;
  status: string;
  store: Store | null;
  writer: Writer | null;
  createdAt: string;
  updatedAt: string;
}

// 사용자별 가게 이미지 (스토어 정보 포함)
export interface UserStoreImage {
  imageId: string;
  url: string;
  createdAt: string;
  writer?: {
    writerId: string;
    name: string;
  };
  store?: {
    storeId: string;
    name: string;
  };
}
