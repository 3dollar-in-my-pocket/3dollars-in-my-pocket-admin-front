import { atom } from 'recoil';

export const AdvertisementsState = atom({
  key: 'advertisements',
  default: [],
});

export const AdvertisementTotalCounts = atom({
  key: 'advertisementTotalCounts',
  default: 0,
});
