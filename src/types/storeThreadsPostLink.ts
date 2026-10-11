export interface StoreThreadsPostLink {
  postId: string;
  url?: string | null;
  createdAt: string;
}

export type StoreThreadsPostLinkSort = 'LATEST' | 'OLDEST';
