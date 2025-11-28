import {StoreInfo} from './review';

export interface StoreMessage {
  messageId: string;
  body: string;
  store?: StoreInfo;
  createdAt: string;
  updatedAt: string;
}
