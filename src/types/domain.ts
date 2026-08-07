/**
 * 여러 도메인 응답에서 공통으로 재사용되는 값 타입
 *
 * api-docs.json(OpenAPI)의 공용 스키마와 1:1로 대응합니다.
 * 특정 도메인의 응답 모델은 해당 도메인 타입 파일에 둡니다.
 */

import { WriterType } from './common';

/** AddressResponse */
export interface Address {
  fullAddress?: string;
}

/** LocationResponse */
export interface Location {
  latitude: number;
  longitude: number;
}

/** ImageResponse */
export interface Image {
  imageUrl: string;
  width?: number;
  height?: number;
  ratio?: number;
}

/** DateTimeIntervalResponse */
export interface DateTimeInterval {
  startDateTime: string;
  endDateTime: string;
}

/** WriterResponse — 리뷰/게시물 작성 주체 */
export interface Writer {
  writerId: string;
  writerType: WriterType;
  name: string;
}
