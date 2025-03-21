import axios from 'axios';

import { AUTH_KEY, AUTH_TOKEN } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  getRegistrations: async (cursor, size) => {
    if (!cursor) {
      return await axios.get(
        `${AUTH_KEY.apiUrl}/admin/v3/boss-registrations?size=${size}`,
        HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
      );
    }
    return await axios.get(
      `${AUTH_KEY.apiUrl}/admin/v3/boss-registrations?cursor=${cursor}&size=${size}`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  approveRegistration: async (registrationId) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/v3/boss-registration/${registrationId}/apply`,
      {},
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
  rejectRegistration: async (registrationId, rejectReason) => {
    return await axios.put(
      `${AUTH_KEY.apiUrl}/admin/v1/v3/boss-registration/${registrationId}/reject`,
      {
        rejectReason,
      },
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
