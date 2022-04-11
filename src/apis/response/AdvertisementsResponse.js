export const AdvertisementsWithPageResponse = (data) => {
  const { totalCounts, contents } = data;
  return {
    totalCounts,
    contents: contents.map((content) => AdvertismentResponse(content)),
  };
};

const AdvertismentResponse = (data) => {
  return {
    advertisementId: data.advertisementId,
    title: data.title,
    subTitle: data.subTitle,
    platformType: data.platformType,
    positionType: data.positionType,
    linkUrl: data.linkUrl,
    bgColor: data.bgColor,
    fontColor: data.fontColor,
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
};
