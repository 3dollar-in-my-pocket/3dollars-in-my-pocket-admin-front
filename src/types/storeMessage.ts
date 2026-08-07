import { SimpleStore } from './store';

export interface StoreMessage {
  messageId: string;
  body: string;
  store?: SimpleStore;
  createdAt: string;
  updatedAt: string;
}
