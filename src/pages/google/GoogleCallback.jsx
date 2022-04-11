import React, { useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { AUTH_KEY, AUTH_TOKEN, GOOGLE_TOKEN_URL } from 'constants';
import { LocalStorageService } from 'services';
import { AuthApi } from 'apis';
import { useRecoilState } from 'recoil';
import { IsLoginState } from 'stores';
import { LoginRequest } from 'apis/dto/request';

async function getAccessToken(code) {
  const { data } = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    clientId: AUTH_KEY.google.clientId,
    clientSecret: AUTH_KEY.google.clientSecret,
    grantType: 'authorization_code',
    redirectUri: AUTH_KEY.google.redirectUri,
  });
  return data.access_token;
}

const GoogleCallback = () => {
  const history = useHistory();

  const [, setIsLoginState] = useRecoilState(IsLoginState);

  useEffect(() => {
    auth();
    async function auth() {
      if (!window.location.search) {
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const accessToken = await getAccessToken(params.get('code'));

      try {
        const { data } = await AuthApi.login(LoginRequest(accessToken, 'GOOGLE'));
        LocalStorageService.set(AUTH_TOKEN, data.data.token);
        setIsLoginState(true);
        history.push('/boss/registration');
      } catch (error) {
        if (!error.response) {
          alert('서버 연결중 에러가 발생하였습니다\n잠시후 다시 시도해주세요');
        } else {
          alert(error.response.data.message);
        }
        history.push('/');
      }
    }
  }, []);
  return (
    <>
      <h1>Loading</h1>
    </>
  );
};

export default GoogleCallback;
