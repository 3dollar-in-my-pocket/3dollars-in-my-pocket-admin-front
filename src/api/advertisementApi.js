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
  createAd: async ({application, adData}) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `/v1/application/${application}/advertisement`,
        data: adData,
      });
      return response.data;
    } catch (error) {
      return error.response;
    }
  },
  deleteAd: async ({application, advertisementId}) => {
    try {
      const response = await axiosInstance({
        method: "DELETE",
        url: `/v1/application/${application}/advertisement/${advertisementId}`,
      });
      return response.data;
    } catch (error) {
      return error.response;
    }
  },
}
