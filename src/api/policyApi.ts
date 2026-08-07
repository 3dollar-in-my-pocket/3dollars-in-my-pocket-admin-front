import {apiDelete, apiGet, apiGetPaginated, apiPatch, apiPost} from "./apiHelpers";
import {ContentListResponse} from "../types/api";
import {Policy, PolicyCategoryId, PolicyId, PolicyType} from "../types/policy";

interface PolicyMutationParams {
  policyId: PolicyId;
  value: string;
}

interface ListPoliciesParams {
  cursor?: string | null;
  size?: number;
  categoryId?: PolicyCategoryId;
}

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
  listPolicies: async ({cursor, size, categoryId}: ListPoliciesParams) => {
    return apiGetPaginated<Policy>(`/v1/policies`, {cursor, size}, {
      ...(categoryId && {categoryId})
    });
  },
  listPolicyTypes: async (categoryId?: PolicyCategoryId) => {
    return apiGet<ContentListResponse<PolicyType>>(`/v1/policy-types`, {
      ...(categoryId && {categoryId})
    });
  }
}
