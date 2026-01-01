import {atom} from 'recoil';

export const LoginStatus = atom<boolean>({
  key: 'loginStatus',
  default: false,
});
