import {PaginatedResponse} from './api';
import {SimpleStore} from './store';

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

/** StorePostResponse (가게 소식·SNS 포스트 공통) */
export interface StorePost {
  postId: string;
  body: string;
  sections: StorePostSection[];
  isOwner: boolean;
  stickers: StorePostSticker[];
  /** 전체 가게 조회 API에서만 채워지고, 가게 단위 API에서는 null */
  store?: SimpleStore | null;
  createdAt: string;
  updatedAt: string;
}

export type StorePostList = PaginatedResponse<StorePost>;
