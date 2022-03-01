import React, { useEffect } from 'react';
import './App.css';
import { useRecoilState } from 'recoil';
import Routes from 'routes';
import { IsLoginState } from 'stores/AuthState';
import { AuthApi } from 'apis';

const App = () => {
  const [, setIsLoginState] = useRecoilState(IsLoginState);
  useEffect(async () => {
    try {
      await AuthApi.getMyInfo();
      setIsLoginState(true);
    } catch (error) {
      setIsLoginState(false);
    }
  }, []);

  return (
    <div className="App">
      <Routes />
    </div>
  );
};

export default App;
