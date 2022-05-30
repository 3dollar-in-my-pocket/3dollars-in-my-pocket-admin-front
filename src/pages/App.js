import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import Routes from 'routes';
import { IsLoginState } from 'stores';
import { AuthApi } from 'apis';
import { useHistory } from 'react-router-dom';
import Navbar from 'components/navbar/Navbar';

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
      <Navbar />
      <Routes />
    </div>
  );
};

export default App;
