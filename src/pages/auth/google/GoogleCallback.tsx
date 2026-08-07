import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';

import googleAuthApi from "@/api/googleAuthApi";
import authApi from "@/api/authApi";
import {useAuthStore} from "@/state/authStore";
import Loading from "@/components/common/Loading";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    auth();

    async function auth() {
      if (!window.location.search) {
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          toast.error('인증 코드가 없습니다.');
          logout();
          navigate('/');
          return;
        }

        // Google OAuth 토큰 가져오기
        const accessToken = await googleAuthApi.getAccessToken({code});

        // 로그인 API 호출
        const response = await authApi.login({
          accessToken,
          socialType: 'GOOGLE'
        });

        if (!response.ok || !response.data.token) {
          toast.error('로그인에 실패했습니다.');
          logout();
          navigate('/');
          return;
        }

        // 로그인 성공
        login(response.data.token);
        navigate('/manage');
      } catch (error) {
        console.error('Google 로그인 처리 중 오류:', error);
        toast.error('로그인 처리 중 오류가 발생했습니다.');
        logout();
        navigate('/');
      }
    }
  }, [navigate, login, logout]);

  return (
    <div className="container-fluid py-4 d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
      <Loading/>
    </div>
  );
};

export default GoogleCallback;
