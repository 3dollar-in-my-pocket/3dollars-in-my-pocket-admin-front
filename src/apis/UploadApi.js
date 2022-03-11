import axios from 'axios';
import { AUTH_KEY } from 'constants/authkey';
import LocalStorageService from 'services/LocalStorageService';
import HttpService from 'services/HttpService';

export default {
  upload: async (req) => {
    return axios.post(
      `${AUTH_KEY.apiUrl}/admin/v1/upload/ADVERTISEMENT_IMAGE`,
      req,
      HttpService.withBearer(LocalStorageService.get('AUTH_TOKEN'))
    );
  },
};
