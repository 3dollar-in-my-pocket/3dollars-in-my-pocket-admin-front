import { DateUtils } from 'utils';

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
    startDateTime: DateUtils.toDateTime(new Date(startDateTime)),
    endDateTime: DateUtils.toDateTime(new Date(endDateTime)),
    subTitle,
    title,
  };
};
