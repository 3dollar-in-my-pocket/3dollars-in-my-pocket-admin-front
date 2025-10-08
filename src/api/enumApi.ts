import axiosInstance from "./apiBase";

export default {
  getEnum: async () => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/enums`,
        }
      );
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
}
