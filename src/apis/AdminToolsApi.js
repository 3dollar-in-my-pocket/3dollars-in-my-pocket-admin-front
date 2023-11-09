import axios from 'axios';

import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  evictAll: async (cacheType) => {
    return await axios.delete(
      `${AUTH_KEY.apiUrl}/admin/v1/tools/cache/${cacheType}/keys`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
