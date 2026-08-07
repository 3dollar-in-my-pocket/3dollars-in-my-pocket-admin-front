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
