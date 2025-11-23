import axiosInstance from "./apiBase";

export default {
  listAds: async ({application, page, size, position, platform, startDateTime, endDateTime}: any) => {
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
    } catch (error: any) {
      return error.response;
    }
  },
  createAd: async ({application, adData, nonce}: any) => {
    try {
      const response = await axiosInstance({
        method: "POST",
        url: `/v1/application/${application}/advertisement`,
        data: adData,
        headers: nonce ? {
          'X-Nonce-Token': nonce,
        } : {},
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
  updateAd: async ({application, advertisementId, adData}: any) => {
    try {
      const response = await axiosInstance({
        method: "PATCH",
        url: `/v1/application/${application}/advertisement/${advertisementId}`,
        data: adData,
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
  updateAdContent: async ({application, advertisementId, contentData}: any) => {
    try {
      const response = await axiosInstance({
        method: "PATCH",
        url: `/v1/application/${application}/advertisement/${advertisementId}`,
        data: {
          content: contentData
        },
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
  deleteAd: async ({application, advertisementId}: any) => {
    try {
      const response = await axiosInstance({
        method: "DELETE",
        url: `/v1/application/${application}/advertisement/${advertisementId}`,
      });
      return response.data;
    } catch (error: any) {
      return error.response;
    }
  },
}
