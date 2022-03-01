import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { IsLoginState } from 'stores/AuthState';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const [isLoggedIn] = useRecoilState(IsLoginState);

  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  );
};

export default PrivateRoute;
