import qs from 'qs';

const {REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_REDIRECT_URI, REACT_APP_API_URI} = process.env;

export const AUTH_KEY = {
    apiUrl: REACT_APP_API_URI,
    google: {
        clientId: REACT_APP_CLIENT_ID,
        clientSecret: REACT_APP_CLIENT_SECRET,
        redirectUri: REACT_APP_REDIRECT_URI,
    },
};

export const GOOGLE_AUTH_QUERY = qs.stringify({
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
    access_type: 'offline',
    include_granted_scopes: 'true',
    redirect_uri: AUTH_KEY.google.redirectUri,
    response_type: 'code',
    client_id: AUTH_KEY.google.clientId,
    prompt: 'select_account',
    state: 'state_parameter_passthrough_value',
});

export const GOOGLE_AUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?${GOOGLE_AUTH_QUERY}`;

export const GOOGLE_TOKEN_URL = `https://oauth2.googleapis.com/token`;
