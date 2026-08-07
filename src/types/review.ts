/**
 * 리뷰 관련 타입 정의
 */

import { Image } from './domain';
import { SimpleStore } from './store';
import { SimpleUser } from './user';

export type ReviewStatus = 'POSTED' | 'FILTERED' | 'DELETED';

/**
 * StoreReviewResponse
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
