import { toDateTime } from 'utils';

export const AddAdvertisementRequest = ({
  bgColor,
  fontColor,
  imageUrl,
  linkUrl,
  platform,
  postition,
  startDateTime,
  endDateTime,
  subTitle,
  title,
}) => {
  return {
    bgColor,
    fontColor,
    imageUrl,
    linkUrl,
    platform,
    postition,
    startDateTime: toDateTime(new Date(startDateTime)),
    endDateTime: toDateTime(new Date(endDateTime)),
    subTitle,
    title,
  };
};
