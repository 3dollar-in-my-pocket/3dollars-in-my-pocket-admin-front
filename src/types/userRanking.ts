import {ApiResponse, PaginatedResponse} from './api';
import {SimpleUser} from './user';

export interface UserRankingItem {
  user: SimpleUser;
  score: number;
}

export type UserRankingResponse = ApiResponse<PaginatedResponse<UserRankingItem>>;

export interface UserRankingRequest {
  userRankingType: string;
  cursor?: string | null;
  size?: number;
}

export const createUserRankingRequest = ({
                                           userRankingType,
                                           cursor = null,
                                           size = 20
                                         }: UserRankingRequest): UserRankingRequest => ({
  userRankingType,
  cursor,
  size
});
