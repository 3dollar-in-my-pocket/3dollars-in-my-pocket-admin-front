import {SimpleStore} from './domain';

export interface StoreMessage {
  messageId: string;
  body: string;
  store?: SimpleStore;
  createdAt: string;
  updatedAt: string;
}
