import axios from 'axios';
import { AUTH_KEY, AUTH_TOKEN } from 'constants';
import { LocalStorageService, HttpService } from 'services';

export default {
  upload: async (req) => {
    return axios.post(
      `${AUTH_KEY.apiUrl}/admin/v1/upload/ADVERTISEMENT_IMAGE`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
