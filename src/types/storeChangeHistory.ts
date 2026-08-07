/**
 * 가게 변경 이력 타입 정의
 */

import { Writer } from './domain';

/** StoreAttributeResponse.type */
export const CHANGE_ATTRIBUTE_TYPE = {
  NAME: 'NAME',
  SALES_TYPE: 'SALES_TYPE',
  PAYMENT_METHOD: 'PAYMENT_METHOD',
  OPENING_DAY: 'OPENING_DAY',
  OPENING_HOUR: 'OPENING_HOUR',
  LOCATION: 'LOCATION',
  MENU: 'MENU',
  IMAGE: 'IMAGE'
} as const;

export type ChangeAttributeType = typeof CHANGE_ATTRIBUTE_TYPE[keyof typeof CHANGE_ATTRIBUTE_TYPE];

/** StoreAttributeResponse */
export interface ChangeAttribute {
  type: ChangeAttributeType;
  description: string;
}

/** StoreChangeHistoryResponse */
export interface StoreChangeHistory {
  changeAttributes: ChangeAttribute[];
  actor: Writer;
  changedAt: string;
}
