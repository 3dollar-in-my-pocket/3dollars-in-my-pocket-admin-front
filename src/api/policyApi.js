import axiosInstance from "./apiBase";

export default {
  createPolicy: async ({policyId, value}) => {
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
    } catch (error) {
      return error.response;
    }
  },
  modifyPolicy: async ({policyId, value}) => {
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
    } catch (error) {
      return error.response;
    }
  },
  deletePolicy: async ({policyId}) => {
    try {
      const response = await axiosInstance(
        {
          method: "DELETE",
          url: `/v1/policy/${policyId}`
        }
      )
      return response.data
    } catch (error) {
      return error.response;
    }
  },
  getPolicy: async ({policyId}) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/policy/${policyId}`
        }
      )
      return response.data
    } catch (error) {
      return error.response;
    }
  },
  listPolicies: async ({cursor, size, categoryId}) => {
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
    } catch (error) {
      return error.response;
    }
  },
  listPolicyTypes: async (categoryId) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/policy/types`,
          params: {
            ...(categoryId && {categoryId})
          }
        }
      )
      return response.data
    } catch (error) {
      return error.response;
    }
  }
}
