import {Navigate} from 'react-router-dom';
import {useAuthStore} from "@/state/authStore";
import adminApi from "@/api/adminApi";
import {ReactElement, useEffect, useState} from "react";
import Loading from "@/components/common/Loading";

interface PrivateRouterProps {
  children: ReactElement;
}

const PrivateRouter = ({children}: PrivateRouterProps) => {
  const setLoggedIn = useAuthStore((state) => state.setLoggedIn);
  const setAdmin = useAuthStore((state) => state.setAdmin);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await adminApi.getMyAdmin();
        if (response.ok) {
          // 인증 확인과 동시에 관리자 정보까지 저장하여 중복 조회를 방지합니다.
          setLoggedIn(true);
          setAdmin(response.data ?? null);
          setIsAuthenticated(true);
        } else {
          setLoggedIn(false);
          setIsAuthenticated(false);
        }
      } catch (e) {
        setLoggedIn(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, [setLoggedIn, setAdmin]);

  if (loading) {
    return <Loading loading={true}/>
  }

  return isAuthenticated ? children : <Navigate to="/" replace/>;
};

export default PrivateRouter;
