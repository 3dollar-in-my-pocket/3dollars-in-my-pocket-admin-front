import axiosInstance from "./apiBase";

export default {
  listRegistrations: async ({size}) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v3/boss-registrations`,
          params: {
            size,
          },
        }
      );
      return response.data;
    } catch (error) {
      return error.response;
    }
  },
  approveRegistration: async ({id}) => {
    try {
      const response = await axiosInstance(
        {
          method: "PUT",
          url: `/v3/boss-registration/${id}/apply`,
        }
      );
      return await response.data.data;
    } catch (error) {
      return error.response;
    }
  },
  denyRegistration: async ({id, rejectReason}) => {
    try {
      const response = await axiosInstance({
        method: "PUT",
        url: `/v3/boss-registration/${id}/reject`,
        data: {
          rejectReason,
        },
      });
      return response.data;
    } catch (error) {
      return error.response;
    }
  },
};
