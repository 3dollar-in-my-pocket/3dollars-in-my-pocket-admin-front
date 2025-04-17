import axiosInstance from "./apiBase";

export default {
  listAds: async ({application, page, size, position, platform, startDateTime, endDateTime}) => {
    try {
      const response = await axiosInstance(
        {
          method: "GET",
          url: `/v1/application/${application}/advertisements`,
          params: {
            page,
            size,
            ...(position && {position}),
            ...(platform && {platform}),
            ...(startDateTime && {startDateTime}),
            ...(endDateTime && {endDateTime}),
          },
        }
      );
      return response.data;
    } catch (error) {
      return error.response;
    }
  },
}
