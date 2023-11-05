import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from 'pages/home/Home';
import NotFound from 'pages/home/404/NotFound';
import GoogleCallback from 'pages/google/GoogleCallback';
import Registration from 'pages/boss/registration/Registration';
import UserAdvertisement from 'pages/common/advertisement/UserAdvertisement';
import MyPage from 'pages/mypage/MyPage';
import UserFaq from 'pages/common/faq/UserFaq';
import BossFaq from 'pages/common/faq/BossFaq';
import Upload from 'pages/upload/Upload';
import AddAdvertisementModal from 'components/advertisement/AddAdvertisementModal';
import PrivateRoute from './PrivateRoute';

const Routes = () => {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path="/auth/google/callback" component={GoogleCallback} />
      <PrivateRoute exact path="/boss/registration" component={Registration} />
      <PrivateRoute exact path="/user/faq" component={UserFaq} />
      <PrivateRoute exact path="/boss/faq" component={BossFaq} />
      <PrivateRoute exact path="/user/advertisement" component={UserAdvertisement} />
      <PrivateRoute exact path="/user/advertisement/manage" component={AddAdvertisementModal} />
      <PrivateRoute exact path="/admin/mypage" component={MyPage} />
      <PrivateRoute exact path="/upload" component={Upload} />
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
