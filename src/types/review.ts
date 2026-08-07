/**
 * 리뷰 관련 타입 정의
 */

import { Image, SimpleStore, SimpleUser } from './domain';

export type ReviewStatus = 'POSTED' | 'FILTERED' | 'DELETED';

/**
 * StoreReviewResponse
 *
 * 가게별(GET /v1/store/{storeId}/reviews), 사용자별
 * (GET /v1/user/{userId}/store-reviews), 전체(GET /v1/store-reviews)
 * 리뷰 목록이 모두 동일하게 사용합니다.
 */
export interface Review {
  reviewId: number;
  rating: number;
  contents?: string;
  status: ReviewStatus;
  images: Image[];
  store?: SimpleStore;
  writer?: SimpleUser;
  createdAt?: string;
  updatedAt?: string;
}

/** 응답 스키마가 Review와 동일합니다. */
export type StoreReview = Review;

/** 응답 스키마가 Review와 동일합니다. */
export type UserReview = Review;
