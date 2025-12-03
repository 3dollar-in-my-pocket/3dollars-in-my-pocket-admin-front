import { ApiResponse, PaginatedResponse } from './api';

export interface UserRankingUser {
  userId: number;
  name: string;
  socialType: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRankingItem {
  user: UserRankingUser;
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
