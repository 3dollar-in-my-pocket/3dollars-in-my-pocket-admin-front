import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from "./apiHelpers";
import {ContentListResponse} from "@/types/api";
import {Policy, PolicyCategoryId, PolicyId, PolicyType} from "@/types/policy";

interface PolicyMutationParams {
  policyId: PolicyId;
  value: string;
}

/** listAllPolicies에서 한 번에 조회하는 건수 (서버 최대 30) */
const LIST_ALL_PAGE_SIZE = 30;
/** listAllPolicies 무한 반복 방지를 위한 최대 페이지 수 */
const LIST_ALL_MAX_PAGES = 50;

interface ListPoliciesParams {
  cursor?: string | null;
  size?: number;
  categoryId?: PolicyCategoryId;
}

const listPolicies = async ({cursor, size, categoryId}: ListPoliciesParams) => {
  return apiGetPaginated<Policy>(`/v1/policies`, {cursor, size}, {
    ...(categoryId && {categoryId})
  });
};

export default {
  createPolicy: async ({policyId, value}: PolicyMutationParams) => {
    return apiPost<void>(`/v1/policy/${policyId}`, {value});
  },
  modifyPolicy: async ({policyId, value}: PolicyMutationParams) => {
    return apiPatch<void>(`/v1/policy/${policyId}`, {value});
  },
  deletePolicy: async ({policyId}: { policyId: PolicyId }) => {
    return apiDelete(`/v1/policy/${policyId}`);
  },
  getPolicy: async ({policyId}: { policyId: PolicyId }) => {
    return apiGet<Policy>(`/v1/policy/${policyId}`);
  },
  listPolicies,
  /**
   * 커서를 끝까지 따라가며 등록된 정책을 모두 조회
   * @returns 조회 실패 시 null
   */
  listAllPolicies: async (categoryId?: PolicyCategoryId): Promise<Policy[] | null> => {
    const result: Policy[] = [];
    let cursor: string | null = null;

    for (let page = 0; page < LIST_ALL_MAX_PAGES; page++) {
      const response = await listPolicies({cursor, size: LIST_ALL_PAGE_SIZE, categoryId});
      if (!response.ok) {
        return null;
      }

      result.push(...(response.data?.contents || []));
      cursor = response.data?.cursor?.nextCursor ?? null;
      if (!response.data?.cursor?.hasMore || !cursor) {
        break;
      }
    }
    return result;
  },
  listPolicyTypes: async (categoryId?: PolicyCategoryId) => {
    return apiGet<ContentListResponse<PolicyType>>(`/v1/policy-types`, {
      ...(categoryId && {categoryId})
    });
  }
}
