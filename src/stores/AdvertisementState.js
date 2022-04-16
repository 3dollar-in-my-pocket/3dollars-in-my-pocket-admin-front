import { atom } from 'recoil';

export const AdvertisementsState = atom({
  key: 'advertisements',
  default: [],
});

export const CurrentAdvertisementCategory = atom({
  key: 'currentAdvertisementCategory',
  default: '',
});
