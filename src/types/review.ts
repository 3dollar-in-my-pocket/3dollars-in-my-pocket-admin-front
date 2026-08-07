/**
 * 리뷰 관련 타입 정의
 */

export interface StoreInfo {
  storeId: string;
  name: string;
  storeType?: string;
  categories?: any[];
  salesType?: any;
  status?: string;
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
  store?: StoreInfo;
}

export type StoreReview = Review;

export type UserReview = Review;
