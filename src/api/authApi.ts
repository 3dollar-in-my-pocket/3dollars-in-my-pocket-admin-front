import axiosInstance from "./apiBase";

export default {
  login: async ({accessToken, socialType}: any) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `/v1/auth/login`,
        data: {
          token: accessToken,
          socialType: socialType,
        },
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  }
}
