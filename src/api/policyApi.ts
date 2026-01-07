import axiosInstance from "./apiBase";

export default {
  createPolicy: async ({policyId, value}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "POST",
          url: `/v1/policy/${policyId}`,
          data: {
            value
          }
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  modifyPolicy: async ({policyId, value}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "PATCH",
          url: `/v1/policy/${policyId}`,
          data: {
            value
          }
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  deletePolicy: async ({policyId}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "DELETE",
          url: `/v1/policy/${policyId}`
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  getPolicy: async ({policyId}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/policy/${policyId}`
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  listPolicies: async ({cursor, size, categoryId}: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/policies`,
          params: {
            cursor,
            size,
            ...(categoryId && {categoryId})
          }
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  },
  listPolicyTypes: async (categoryId: any) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/policy-types`,
          params: {
            ...(categoryId && {categoryId})
          }
        }
      )
      return response.data
    } catch (error: any) {
      return error.response;
    }
  }
}
