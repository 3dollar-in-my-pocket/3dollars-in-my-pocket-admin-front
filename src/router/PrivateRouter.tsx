import {Navigate} from 'react-router-dom';
import {useRecoilState} from "recoil";
import {LoginStatus} from "../state/LoginStatus";
import adminApi from "../api/adminApi";
import {useEffect, useState} from "react";
import Loading from "../components/common/Loading";

const PrivateRouter = ({children}) => {
  const [, setIsLoginState] = useRecoilState(LoginStatus);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await adminApi.getMyAdmin();
        if (response.ok) {
          setIsLoginState(true);
          setIsAuthenticated(true);
        } else {
          setIsLoginState(false);
          setIsAuthenticated(false);
        }
      } catch (e) {
        setIsLoginState(false);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, [setIsLoginState]);

  if (loading) {
    return <Loading loading={true}/>
  }

  return isAuthenticated ? children : <Navigate to="/" replace/>;
};

export default PrivateRouter;
