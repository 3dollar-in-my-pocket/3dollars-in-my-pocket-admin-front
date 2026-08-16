/**
 * 가게 지도 핀(마커) 타입 정의
 */

import {DateTimeInterval, Image} from './domain';

/** ImageRequest — 등록/수정 요청의 이미지는 url을 사용합니다. */
export interface StoreMarkerImageRequest {
  url: string;
  width: number;
  height: number;
}

/** StoreMarkerResponse */
export interface StoreMarker {
  markerId: number;
  groupId: string;
  storeId: number;
  /** 응답의 이미지는 imageUrl을 사용합니다. (요청과 필드명이 다름) */
  selectedMarkerImage: Image;
  unselectedMarkerImage: Image;
  period: DateTimeInterval;
}

/** StoreMarkerCreateRequest / StoreMarkerUpdateRequest (동일 구조) */
export interface StoreMarkerRequest {
  groupId: string;
  selectedMarkerImage: StoreMarkerImageRequest;
  unselectedMarkerImage: StoreMarkerImageRequest;
  startDateTime: string;
  endDateTime: string;
}

export interface BulkStoreMarkerCreateRequest extends StoreMarkerRequest {
  storeIds: number[];
}

export interface BulkStoreMarkerUpdateRequest extends StoreMarkerRequest {
  markerIds: number[];
}

export interface CreatedStoreMarker {
  storeId: number;
  markerId: number;
}

export interface BulkStoreMarkerCreateResponse {
  markers: CreatedStoreMarker[];
}

export interface StoreMarkerFilter {
  filterStartDateTime?: string;
  filterEndDateTime?: string;
}
