import axiosInstance from "./apiBase";

export default {
  getMyAdmin: async () => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/my/admin`,
        })

      return response.data;
    } catch (error) {
      return error.response;
    }
  },

  getAdmins: async ({ size = 10, page = 1 } = {}) => {
    try {
      const response = await axiosInstance({
        method: "GET",
        url: `/v1/admins`,
        params: {
          size,
          page
        }
      });

      return response.data;
    } catch (error) {
      return error.response;
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `/v1/admin`,
        data: adminData
      });

      return response.data;
    } catch (error) {
      return error.response;
    }
  }
}
