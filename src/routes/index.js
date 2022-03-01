import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from 'pages/home/Home';
import NotFound from 'pages/home/404/NotFound';
import GoogleCallback from 'pages/google/GoogleCallback';
import Registration from 'pages/boss/registration/Registration';
import Advertisement from 'pages/user/advertisement/Advertisement';
import PrivateRoute from './PrivateRoute';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/auth/google/callback" component={GoogleCallback} />
      <PrivateRoute exact path="/boss/registration" component={Registration} />
      <PrivateRoute
        exact
        path="/user/advertisement"
        component={Advertisement}
      />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
