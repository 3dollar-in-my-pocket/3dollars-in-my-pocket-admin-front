import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from 'pages/home/Home';
import NotFound from 'pages/home/404/NotFound';
import GoogleCallback from 'pages/google/GoogleCallback';

const Routes = () => (
  <Switch>
    <Route exact path="/" component={Home} />
    <Route exact path="/auth/google/callback" component={GoogleCallback} />
    <Route component={NotFound} />
  </Switch>
);

export default Routes;
