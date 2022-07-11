import axios from 'axios';
import { AUTH_KEY } from 'constants';

export default {
  getEnums: async () => {
    return await axios.get(`${AUTH_KEY.apiUrl}/admin/v1/enums`);
  },
};
