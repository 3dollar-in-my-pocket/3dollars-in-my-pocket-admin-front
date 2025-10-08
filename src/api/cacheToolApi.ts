import axiosInstance from "./apiBase";

export default {
  evictAll: async (cacheType: string) => {
    try {
      const response = await axiosInstance({
        method: "DELETE", url: `/v2/cache/${cacheType}/all`,
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  }
}
