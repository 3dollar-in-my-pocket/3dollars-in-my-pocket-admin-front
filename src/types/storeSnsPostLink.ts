export type SnsPlatform = 'THREADS' | 'INSTAGRAM';

export interface StoreSnsPostLink {
  postId: string;
  platform: SnsPlatform;
  url?: string | null;
  createdAt: string;
}

export type StoreSnsPostLinkSort = 'LATEST' | 'OLDEST';
