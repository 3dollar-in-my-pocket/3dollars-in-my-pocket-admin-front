import axios from 'axios';

import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  getAdvertisements: async (page, size, applicationType) => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/user/advertisements?page=${page}&size=${size}&applicationType=${applicationType}`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  addAdvertisement: async (req) => {
    await axios.post(
      `${AUTH_KEY.apiUrl}/admin/v1/user/advertisement`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  updateAdvertisement: async (advertisementId, req) => {
    await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/user/advertisements/${advertisementId}`,
      req,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
