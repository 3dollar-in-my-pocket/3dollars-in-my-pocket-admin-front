import axios from 'axios';
import { AUTH_KEY } from 'constants/authkey';
import { AUTH_TOKEN } from 'constants/authtoken';
import HttpService from 'services/HttpService';
import LocalStorageService from 'services/LocalStorageService';

export default {
  login: async (req) => {
    return await axios.post(`${AUTH_KEY.apiUrl}/admin/v1/auth/login`, req);
  },
  getAdvertisements: async (page, size) => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/user/advertisements?page=${page}&size=${size}`,
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
