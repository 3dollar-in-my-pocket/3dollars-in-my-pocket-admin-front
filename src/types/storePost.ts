import {PaginatedResponse} from './api';

export const STORE_POST_SORT = {
  LATEST: 'LATEST',
  OLDEST: 'OLDEST',
} as const;

export type StorePostSort = typeof STORE_POST_SORT[keyof typeof STORE_POST_SORT];

export interface StorePostSection {
  sectionType: string;
  url: string;
  ratio: number;
}

export interface StorePostSticker {
  stickerId: string;
  emoji: string;
  count: number;
  reactedByMe: boolean;
}

export interface StorePost {
  postId: string;
  body: string;
  sections: StorePostSection[];
  isOwner: boolean;
  stickers: StorePostSticker[];
  createdAt: string;
  updatedAt: string;
}

export type StorePostList = PaginatedResponse<StorePost>;
