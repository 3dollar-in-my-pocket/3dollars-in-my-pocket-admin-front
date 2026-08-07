import {apiDelete, apiGet, apiPatch, apiPost} from "./apiHelpers";

export default {
  listAds: async ({application, page, size, position, platform, startDateTime, endDateTime}: any) => {
    return apiGet<any>(`/v1/application/${application}/advertisements`, {
      page,
      size,
      ...(position && {position}),
      ...(platform && {platform}),
      ...(startDateTime && {startDateTime}),
      ...(endDateTime && {endDateTime}),
    });
  },
  createAd: async ({application, adData, nonce}: any) => {
    return apiPost<any>(`/v1/application/${application}/advertisement`, adData, {nonce});
  },
  updateAd: async ({application, advertisementId, adData}: any) => {
    return apiPatch<any>(`/v1/application/${application}/advertisement/${advertisementId}`, adData);
  },
  updateAdContent: async ({application, advertisementId, contentData}: any) => {
    return apiPatch<any>(`/v1/application/${application}/advertisement/${advertisementId}`, {
      content: contentData
    });
  },
  deleteAd: async ({application, advertisementId}: any) => {
    return apiDelete(`/v1/application/${application}/advertisement/${advertisementId}`);
  },
}
