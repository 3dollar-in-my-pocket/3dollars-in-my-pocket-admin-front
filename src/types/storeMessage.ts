import { SimpleStore } from './store';

/** MessageResponse */
export interface StoreMessage {
  messageId: string;
  body: string;
  store?: SimpleStore;
  createdAt: string;
  updatedAt: string;
}
