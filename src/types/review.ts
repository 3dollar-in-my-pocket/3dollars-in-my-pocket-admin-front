export interface ReviewImage {
  imageUrl: string;
  width: number;
  height: number;
}

export interface StoreCategory {
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
  classification: {
    type: string;
    description: string;
  };
  isNew: boolean;
}

export interface StoreInfo {
  storeId: number;
  storeType: 'USER_STORE' | 'BOSS_STORE';
  name: string;
  rating: number;
  address: any;
  categories: StoreCategory[];
  status: 'ACTIVE' | 'DELETED';
  activitiesStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewWriter {
  userId: number;
  name: string;
  socialType: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReview {
  reviewId: number;
  rating: number;
  contents: string;
  status: 'ACTIVE' | 'FILTERED' | 'DELETED';
  images: ReviewImage[];
  store?: StoreInfo;
  writer?: ReviewWriter;
  createdAt: string;
  updatedAt: string;
}

export interface StoreReviewsResponse {
  contents: StoreReview[];
  cursor: {
    nextCursor?: string;
    hasMore: boolean;
  };
}
