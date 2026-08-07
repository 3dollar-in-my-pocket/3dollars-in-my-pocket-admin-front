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

/**
 * 활동 이력에서 "작성자 클릭"으로 전달되는 사용자 식별 정보
 *
 * 호출부마다 넘기는 객체 형태가 다릅니다.
 * - StoreReviewHistory/StoreImageHistory/StoreReportHistory/StoreVisitHistory:
 *   응답의 writer/reporter/visitor(SimpleUser)를 그대로 전달 → userId: number
 * - StoreContributorHistory: Writer로부터 {userId: writerId, name, writerType}를 생성 → userId: string
 *
 * 수신부(StoreSearch.handleAuthorClick)는 `writer.userId || writer.writerId || writer.id`와
 * `writer.name || writer.nickname`을 방어적으로 읽으므로, 위 형태들의 합집합으로 정의합니다.
 */
export interface ActivityAuthor {
  userId?: number | string;
  writerId?: string;
  id?: number | string;
  name?: string;
  nickname?: string;
  writerType?: WriterType;
}
