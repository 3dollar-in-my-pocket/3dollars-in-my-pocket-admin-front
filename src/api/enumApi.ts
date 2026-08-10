import {apiGet} from "./apiHelpers";

export default {
  getEnum: async () => {
    return apiGet<Record<string, any[]>>(`/v1/enums`);
  },
}
