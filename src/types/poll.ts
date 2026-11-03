/**
 * 투표(Poll) 도메인 응답 타입
 *
 * api-docs.json(OpenAPI)의 Poll*Response와 1:1로 대응합니다.
 */

import {DateTimeInterval, Writer} from './domain';

/** PollCategoryResponse */
export interface PollCategory {
  categoryId: string;
  title: string;
  content: string;
}

/** PollContentResponse */
export interface PollContent {
  title: string;
  /** 투표 본문 (없으면 null) */
  content?: string | null;
}

/** PollOptionResponse */
export interface PollOption {
  optionId: number;
  name: string;
  count: number;
  /** 0~1 사이의 득표 비율 */
  ratio: number;
}

/** PollMetadataResponse */
export interface PollMetadata {
  commentCount: number;
}

/** PollSimpleResponse — 투표 목록 항목 */
export interface Poll {
  pollId: number;
  category: PollCategory;
  content: PollContent;
  writer?: Writer | null;
  options: PollOption[];
  period: DateTimeInterval;
  metadata: PollMetadata;
  createdAt?: string;
  updatedAt?: string;
}

/** 투표 목록 정렬 */
export type PollSortType = 'LATEST' | 'POPULAR' | 'OLDEST';

/** PollPinPollResponse — 고정 설정에 포함된 투표 자체 데이터 (득표·작성자·댓글 수 없음) */
export interface PollPinPoll {
  pollId: number;
  category: PollCategory;
  content: PollContent;
  options: Pick<PollOption, 'optionId' | 'name'>[];
  period: DateTimeInterval;
}

/** PollPinResponse — 인기 투표 목록 고정 노출 설정 */
export interface PollPin {
  pollPinId: number;
  categoryId: string;
  pollId: number;
  /** 고정 위치 (1~30) */
  position: number;
  startDateTime: string;
  endDateTime: string;
  /** 고정된 투표. 삭제된 투표면 null */
  poll?: PollPinPoll | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 고정 노출 설정 등록 요청 */
export interface CreatePollPinRequest {
  categoryId: string;
  pollId: number;
  position: number;
  startDateTime: string;
  endDateTime: string;
}

/** 고정 노출 설정 수정 요청 (partial update — 전달한 필드만 변경) */
export type UpdatePollPinRequest = Partial<Pick<PollPin, 'position' | 'startDateTime' | 'endDateTime'>>;
