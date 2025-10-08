import axios from "axios";
import {AUTH_KEY, GOOGLE_TOKEN_URL} from "../constants/google";

export default {
  getAccessToken: async ({code}: any) => {
    const response = await axios.post(GOOGLE_TOKEN_URL, {
      code,
      clientId: AUTH_KEY.google.clientId,
      clientSecret: AUTH_KEY.google.clientSecret,
      grantType: 'authorization_code',
      redirectUri: AUTH_KEY.google.redirectUri,
    });
    return response.data['access_token'];
  }
}
