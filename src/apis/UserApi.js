import axios from 'axios';
import { AUTH_TOKEN, AUTH_KEY } from 'constants';
import { HttpService, LocalStorageService } from 'services';

export default {
    listUsers: async (name, userIds) => {
        return await axios.get(
            `${AUTH_KEY.apiUrl}/admin/v1/search/users?name=${name}&userIds=${userIds}`,
            HttpService.withBearer(LocalStorageService.get(AUTH_TOKEN))
        );
    },
};
