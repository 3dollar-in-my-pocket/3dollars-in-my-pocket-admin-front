import { StoreInfo } from './review';

export interface StoreImageWriter {
  userId: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoreImage {
  imageId: number;
  url: string;
  status: 'ACTIVE' | 'INACTIVE';
  store?: StoreInfo;
  writer?: StoreImageWriter;
  createdAt: string;
  updatedAt: string;
}

export interface StoreImagesResponse {
  contents: StoreImage[];
  cursor: {
    nextCursor?: string;
    hasMore: boolean;
  };
}
