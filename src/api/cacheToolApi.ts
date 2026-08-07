import {apiDelete} from "./apiHelpers";

export default {
  evictAll: async (cacheType: string) => {
    return apiDelete(`/v2/cache/${cacheType}/all`);
  }
}
