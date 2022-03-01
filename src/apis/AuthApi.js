import axios from 'axios';
import { AUTH_KEY } from 'constants/authkey';
import HttpService from 'services/HttpService';
import LocalStorageService from 'services/LocalStorageService';

export default {
  login: async (req) => {
    return await axios.post(`${AUTH_KEY.apiUrl}/admin/v1/auth/login`, req);
  },
  getAdminInfo: async () => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/admin/me`,
      HttpService.withBearer(LocalStorageService.get('AUTH_TOKEN'))
    );
  },
};
