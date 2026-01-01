/**
 * 리뷰 관련 타입 정의
 */

export interface StoreInfo {
  storeId: string;
  name: string;
  storeType?: string;
  categories?: any[];
  address?: {
    fullAddress?: string;
  };
}

export interface Review {
  reviewId: string;
  rating: number;
  contents: string;
  createdAt: string;
  updatedAt?: string;
  status?: string;
  writer?: {
    userId: string;
    name: string;
    socialType?: string;
  };
  images?: any[];
}

export interface StoreReview extends Review {
  store?: StoreInfo;
}

export interface UserReview extends Review {
  store?: StoreInfo;
}
