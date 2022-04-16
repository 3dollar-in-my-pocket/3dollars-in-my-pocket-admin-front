import axios from 'axios';
import { AUTH_KEY, AUTH_TOKEN } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  getRegistrations: async (cursor, size) => {
    if (!cursor) {
      return await axios.get(
        `${AUTH_KEY.apiUrl}/admin/v1/boss/account/registrations?size=${size}`,
        HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
      );
    }
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v1/boss/account/registrations?cursor=${cursor}&size=${size}`,
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
