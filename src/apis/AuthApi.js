import axios from 'axios';

import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  login: async (req) => {
    return await axios.post(`${AUTH_KEY.apiUrl}/admin/v1/auth/login`, req);
  },
  getAdminInfo: async () => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/my/admin`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  updateAdminInfo: async (req) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/my/admin`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
