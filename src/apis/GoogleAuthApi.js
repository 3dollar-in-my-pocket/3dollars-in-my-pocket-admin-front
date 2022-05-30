import axios from 'axios';

import { AUTH_KEY, GOOGLE_TOKEN_URL } from 'constants';

export default {
  getAccessToken: async (code) => {
    const { data } = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      clientId: AUTH_KEY.google.clientId,
      clientSecret: AUTH_KEY.google.clientSecret,
      grantType: 'authorization_code',
      redirectUri: AUTH_KEY.google.redirectUri,
    });
    return data.access_token;
  },
};
