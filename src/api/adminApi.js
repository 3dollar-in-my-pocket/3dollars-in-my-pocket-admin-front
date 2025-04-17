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
}
