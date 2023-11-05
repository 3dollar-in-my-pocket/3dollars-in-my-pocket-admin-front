import axios from 'axios';

import { AUTH_KEY, AUTH_TOKEN } from 'constants';
import { LocalStorageService, HttpService } from 'services';

export default {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(
      `${AUTH_KEY.apiUrl}/admin/v1/file/ADVERTISEMENT_IMAGE`,
      formData,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
