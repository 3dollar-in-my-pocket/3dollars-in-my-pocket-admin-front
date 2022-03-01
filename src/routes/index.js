import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from 'pages/home/Home';
import NotFound from 'pages/home/404/NotFound';
import GoogleCallback from 'pages/google/GoogleCallback';
import Registration from 'pages/boss/registration/Registration';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/auth/google/callback" component={GoogleCallback} />
    <Route exact path="/boss/registration" component={Registration} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
