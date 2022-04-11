import axios from 'axios';
import { AUTH_KEY } from 'constants/authkey';
import { AUTH_TOKEN } from 'constants/authtoken';
import HttpService from 'services/HttpService';
import LocalStorageService from 'services/LocalStorageService';

export default {
  getRegistrations: async () => {
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/boss/account/registrations`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  approveRegistration: async (registrationId) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/boss/account/registration/${registrationId}/apply`,
      {},
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  rejectRegistration: async (registrationId) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/boss/account/registration/${registrationId}/reject`,
      {},
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
