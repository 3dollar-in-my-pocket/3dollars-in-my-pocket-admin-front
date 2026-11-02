import {SimpleStore, StoreDetail, StorePreference, StoreTransferResult, StoreType} from '@/types/store';
import {StoreChangeHistory} from '@/types/storeChangeHistory';
import {StorePost} from '@/types/storePost';
import {StoreMessage} from '@/types/storeMessage';
import {Coupon} from '@/types/coupon';
import {ApiResponse, PaginatedResponse} from '@/types/api';
import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from './apiHelpers';

/** 가게 데이터 이관은 데이터 양에 따라 오래 걸릴 수 있어 기본 타임아웃(5초)보다 길게 둡니다. */
const STORE_TRANSFER_TIMEOUT_MS = 180_000;

/**
 * targetStores 필터를 쿼리 파라미터로 변환합니다.
 * 비어 있으면 파라미터를 보내지 않습니다.
 */
const buildTargetStoresParam = (
  targetStores: StoreType[] | null
): Record<string, string> => {
  if (!targetStores || targetStores.length === 0) {
    return {};
  }

  return {targetStores: targetStores.join(',')};
};

export default {
  /**
   * 가게 검색
   */
  searchStores: async (
    keyword: string,
    cursor: string | null = null,
    size = 30,
    targetStores: StoreType[] | null = null
  ): Promise<ApiResponse<PaginatedResponse<SimpleStore>>> => {
    return apiGetPaginated<SimpleStore>(
      '/v1/search/stores',
      {cursor, size},
      {keyword, ...buildTargetStoresParam(targetStores)}
    );
  },

  /**
   * 가게 목록 조회 (최신순)
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=30] - 페이지 사이즈
   * @param {Array<string>} [targetStores] - 필터링할 가게 타입 (USER_STORE, BOSS_STORE)
   */
  getStores: async (
    cursor: string | null = null,
    size = 30,
    targetStores: StoreType[] | null = null
  ): Promise<ApiResponse<PaginatedResponse<SimpleStore>>> => {
    return apiGetPaginated<SimpleStore>(
      '/v1/stores',
      {cursor, size},
      buildTargetStoresParam(targetStores)
    );
  },

  /**
   * 가게 상세 정보 조회
   * @param {string} storeId - 가게 ID
   * @param options.suppressToast - 실패를 화면에서 직접 안내할 때 공통 에러 토스트를 끕니다.
   */
  getStoreDetail: async (
    storeId: string,
    options?: { suppressToast?: boolean }
  ): Promise<ApiResponse<StoreDetail>> => {
    return apiGet<StoreDetail>(`/v1/store/${storeId}`, undefined, options);
  },

  /**
   * 가게 정보 수정
   * @param {string} storeId - 수정할 가게 ID
   * @param {Object} data - 수정할 데이터 (name, labels)
   */
  updateStore: async (
    storeId: string,
    data: { name?: string; labels?: string[] }
  ): Promise<ApiResponse<void>> => {
    return apiPatch<void>(`/v1/store/${storeId}`, data);
  },

  updateStoreLabelsBulk: async (
    storeIds: number[],
    labels?: string[]
  ): Promise<ApiResponse<void>> => {
    return apiPatch<void>('/v1/stores', {
      storeIds,
      ...(labels !== undefined && {labels})
    });
  },

  /**
   * 가게 삭제
   * @param {string} storeId - 삭제할 가게 ID
   */
  deleteStore: async (storeId: string): Promise<ApiResponse<void>> => {
    return apiDelete(`/v1/store/${storeId}`);
  },

  /**
   * 가게 데이터 이관 (중복 유저 가게 합치기)
   *
   * 원본 가게의 리뷰·이미지·방문·즐겨찾기를 대상 가게로 옮깁니다. 원본 가게는 삭제하지 않습니다.
   * 같은 요청을 재호출하면 원본에 남은 데이터를 이어서 이관하므로 nonce를 쓰지 않습니다.
   * 데이터가 많으면 오래 걸려 타임아웃을 넉넉히 두고, 실패 안내는 호출부에서 error 코드로 처리합니다.
   * @param {string} sourceStoreId - 원본 가게 ID (데이터를 가져올 가게)
   * @param {number} targetStoreId - 대상 가게 ID (데이터를 받을 가게)
   */
  transferStoreData: async (
    sourceStoreId: string,
    targetStoreId: number
  ): Promise<ApiResponse<StoreTransferResult>> => {
    return apiPost<StoreTransferResult>(
      `/v1/store/${sourceStoreId}/transfer`,
      {targetStoreId},
      {timeout: STORE_TRANSFER_TIMEOUT_MS, suppressToast: true}
    );
  },

  /**
   * 사용자가 제보한 가게 목록 조회
   * @param {string} userId - 사용자 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   */
  getUserStores: async (
    userId: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<SimpleStore>>> => {
    return apiGetPaginated<SimpleStore>(`/v1/user/${userId}/stores`, {cursor, size});
  },

  /**
   * 가게 소식 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   */
  getStorePosts: async (
    storeId: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<StorePost>>> => {
    return apiGetPaginated<StorePost>(`/v1/store/${storeId}/posts`, {cursor, size});
  },

  /**
   * 가게 메시지 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   */
  getStoreMessages: async (
    storeId: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<StoreMessage>>> => {
    return apiGetPaginated<StoreMessage>(`/v1/store/${storeId}/messages`, {cursor, size});
  },

  /**
   * 가게 설정 정보 조회
   * @param {string} storeId - 가게 ID
   */
  getStorePreference: async (storeId: string): Promise<ApiResponse<StorePreference>> => {
    return apiGet<StorePreference>(`/v1/store/${storeId}/preference`);
  },

  /**
   * 가게 쿠폰 목록 조회
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   */
  getStoreCoupons: async (
    storeId: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<Coupon>>> => {
    return apiGetPaginated<Coupon>(`/v1/store/${storeId}/coupons`, {cursor, size});
  },

  /**
   * 가게 변경 이력 조회 (기여자 목록)
   * @param {string} storeId - 가게 ID
   * @param {string} [cursor] - 페이징 커서
   * @param {number} [size=20] - 페이지 사이즈
   */
  getStoreChangeHistories: async (
    storeId: string,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<StoreChangeHistory>>> => {
    return apiGetPaginated<StoreChangeHistory>(
      `/v1/store/${storeId}/change-histories`,
      {cursor, size}
    );
  },

  /**
   * 사장님 가게 강제 영업 종료
   * @param {string} storeId - 가게 ID
   */
  forceCloseStore: async (storeId: string): Promise<ApiResponse<void>> => {
    return apiDelete(`/v1/store/${storeId}/open`);
  },
};
