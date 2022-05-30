import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from 'pages/App';
import { RecoilRoot } from 'recoil';

import './index.css';

ReactDOM.render(
  <Router>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </Router>,
  document.getElementById('root')
);
