import axios from 'axios';
import { AUTH_KEY } from 'constants/authkey';
import { AUTH_TOKEN } from 'constants/authtoken';
import HttpService from 'services/HttpService';
import LocalStorageService from 'services/LocalStorageService';

export default {
  login: async (req) => {
    return await axios.post(`${AUTH_KEY.apiUrl}/admin/v1/auth/login`, req);
  },
  getAdminInfo: async () => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/account/admin/my-info`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
