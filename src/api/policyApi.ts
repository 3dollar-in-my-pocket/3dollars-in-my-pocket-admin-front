import {apiDelete, apiGet, apiPatch, apiPost} from "./apiHelpers";

export default {
  createPolicy: async ({policyId, value}: any) => {
    return apiPost(`/v1/policy/${policyId}`, {value});
  },
  modifyPolicy: async ({policyId, value}: any) => {
    return apiPatch(`/v1/policy/${policyId}`, {value});
  },
  deletePolicy: async ({policyId}: any) => {
    return apiDelete(`/v1/policy/${policyId}`);
  },
  getPolicy: async ({policyId}: any) => {
    return apiGet<any>(`/v1/policy/${policyId}`);
  },
  listPolicies: async ({cursor, size, categoryId}: any) => {
    return apiGet<any>(`/v1/policies`, {
      cursor,
      size,
      ...(categoryId && {categoryId})
    });
  },
  listPolicyTypes: async (categoryId: any) => {
    return apiGet<any>(`/v1/policy-types`, {
      ...(categoryId && {categoryId})
    });
  }
}
