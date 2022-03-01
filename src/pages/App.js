import React, { useEffect } from 'react';
import './App.css';
import { useRecoilState } from 'recoil';
import Routes from 'routes';
import { IsLoginState } from 'stores/AuthState';
import { AuthApi } from 'apis';
import { useHistory } from 'react-router-dom';

const App = () => {
  const [, setIsLoginState] = useRecoilState(IsLoginState);
  const history = useHistory();
  useEffect(async () => {
    try {
      await AuthApi.getAdminInfo();
      setIsLoginState(true);
    } catch (error) {
      setIsLoginState(false);
      history.push('/');
    }
  }, []);

  return (
    <div className="App">
      <Routes />
    </div>
  );
};

export default App;
