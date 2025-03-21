import axios from 'axios';

import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
  evictAll: async (cacheType) => {
    return await axios.delete(
      `${AUTH_KEY.apiUrl}/admin/v2/cache/${cacheType}/all`,
      HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
    );
  },
};
