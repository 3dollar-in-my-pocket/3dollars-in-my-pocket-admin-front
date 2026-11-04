import {ApiResponse, PaginatedResponse} from '@/types/api';
import {StoreTransferResult} from '@/types/store';
import {StoreDuplicateCandidate, StoreDuplicateCandidateStatus} from '@/types/storeDuplicateCandidate';
import {apiGetPaginated, apiPost} from './apiHelpers';

/** 머지는 다수 데이터를 이관해 기본 타임아웃(5초)보다 오래 걸릴 수 있습니다. (가게 이관과 동일) */
const MERGE_TIMEOUT_MS = 180_000;

export default {
  /** 중복 의심 가게 후보 목록 (이름 유사도 내림차순, 동률이면 최신 후보 먼저) */
  getCandidates: async (
    status: StoreDuplicateCandidateStatus,
    cursor: string | null = null,
    size = 20
  ): Promise<ApiResponse<PaginatedResponse<StoreDuplicateCandidate>>> => {
    return apiGetPaginated<StoreDuplicateCandidate>('/v1/store-duplicate-candidates', {cursor, size}, {status});
  },

  /**
   * 후보 머지: 원본(USER_STORE) 가게의 데이터를 상대 가게로 이관하고 원본을 삭제합니다.
   * 실패 시 후보가 PENDING으로 복구되어 재시도할 수 있으므로 nonce를 쓰지 않습니다.
   * 에러 코드별 안내는 호출부에서 처리합니다.
   */
  merge: async (candidateId: string, sourceStoreId: number): Promise<ApiResponse<StoreTransferResult>> => {
    return apiPost<StoreTransferResult>(
      `/v1/store-duplicate-candidate/${candidateId}/merge`,
      {sourceStoreId},
      {timeout: MERGE_TIMEOUT_MS, suppressToast: true}
    );
  },

  /** 후보 무시: 중복이 아닌 것으로 처리합니다. 되돌릴 수 없습니다. */
  ignore: async (candidateId: string): Promise<ApiResponse<null>> => {
    return apiPost<null>(`/v1/store-duplicate-candidate/${candidateId}/ignore`, undefined, {suppressToast: true});
  },
};
