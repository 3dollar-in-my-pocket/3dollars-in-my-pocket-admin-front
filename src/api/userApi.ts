import {apiGet, apiGetPaginated, apiPut} from './apiHelpers';
import {ApiResponse, ContentListResponse} from '@/types/api';
import {Medal} from '@/types/medal';
import {
  createRandomNameResponse,
  createUserDetailResponse,
  createUserSearchResponse,
  createUserSettings,
  RandomNameItem,
  RandomNameResponse,
  SimpleUser,
  User,
  UserDetailResponse,
  UserRole,
  UserSearchRequest,
  UserSearchResponse,
  UserSettings
} from '@/types/user';

/** UserDetailResponse (서버 원본 모델) */
interface RawUserDetailResponse {
  user: SimpleUser;
  medals?: Medal[];
  representativeMedal?: Medal | null;
  setting?: UserSettings | null;
}

/**
 * 서버의 UserResponse에는 nickname 필드가 없습니다.
 * 화면에서는 name을 닉네임으로 표시하므로 여기서 별칭을 채워줍니다.
 */
const toUser = (user: SimpleUser): User => ({
  userId: user.userId != null ? String(user.userId) : undefined,
  name: user.name,
  nickname: user.name,
  socialType: user.socialType,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export default {
  /**
   * 사용자 검색
   */
  searchUsers: async (searchRequest: UserSearchRequest): Promise<ApiResponse<UserSearchResponse>> => {
    // 이름으로 검색하는 경우 (커서 기반 페이지네이션)
    if (searchRequest.type === 'name' && searchRequest.query) {
      const response = await apiGetPaginated<SimpleUser>(
        '/v1/search/users',
        {cursor: searchRequest.cursor, size: searchRequest.size},
        {name: searchRequest.query}
      );

      const contents = response.data?.contents || [];

      return {
        ok: response.ok,
        data: createUserSearchResponse({
          users: contents.map(toUser),
          hasMore: response.data?.cursor?.hasMore || false,
          nextCursor: response.data?.cursor?.nextCursor || null,
          totalCount: contents.length
        })
      };
    }

    // 유저 ID로 검색하는 경우 (쉼표로 구분된 여러 ID 지원, 페이지네이션 없음)
    if (searchRequest.type === 'userId' && searchRequest.userIds && searchRequest.userIds.length > 0) {
      const response = await apiGet<ContentListResponse<SimpleUser>>('/v1/users', {
        userIds: searchRequest.userIds.join(',')
      });

      const contents = response.data?.contents || [];

      return {
        ok: response.ok,
        data: createUserSearchResponse({
          users: contents.map(toUser),
          hasMore: false,
          nextCursor: null,
          totalCount: contents.length
        })
      };
    }

    return {
      ok: false,
      data: createUserSearchResponse({}),
      message: '검색 타입이 올바르지 않습니다.'
    };
  },

  /**
   * 사용자 상세 정보 조회
   * @param {string} userId - 사용자 ID
   * @returns 사용자 상세 정보
   */
  getUserDetail: async (userId: string): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await apiGet<RawUserDetailResponse>(`/v1/user/${userId}`);

    if (!response.ok || !response.data) {
      return {ok: false, data: createUserDetailResponse({})};
    }

    const {user, representativeMedal, medals, setting} = response.data;

    return {
      ok: true,
      data: createUserDetailResponse({
        user: user ? toUser(user) : null,
        representativeMedal: representativeMedal || null,
        medals: medals || [],
        setting: setting ? createUserSettings(setting) : null
      })
    };
  },

  /**
   * 사용자 권한 변경
   * @param {string} userId - 사용자 ID
   * @param {UserRole} role - 변경할 권한
   * @returns 변경된 사용자 정보
   */
  updateUserRole: async (userId: string, role: UserRole): Promise<ApiResponse<SimpleUser>> => {
    return apiPut<SimpleUser>(`/v1/user/${userId}/role`, {role});
  },

  /**
   * 유저 랜덤 이름 풀 조회
   * @returns 랜덤 이름 목록
   */
  getRandomNames: async (): Promise<ApiResponse<RandomNameResponse>> => {
    const response = await apiGet<ContentListResponse<RandomNameItem>>('/v1/user/random-names');

    return {
      ok: response.ok,
      data: createRandomNameResponse({contents: response.data?.contents || []})
    };
  },
};
