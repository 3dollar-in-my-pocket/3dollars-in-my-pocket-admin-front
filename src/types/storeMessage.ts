import { StoreInfo } from './review';

export interface StoreMessage {
  messageId: string;
  body: string;
  store?: StoreInfo;
  createdAt: string;
  updatedAt: string;
}

export interface StoreMessagesResponse {
  contents: StoreMessage[];
  cursor: {
    nextCursor?: string;
    hasMore: boolean;
  };
}
