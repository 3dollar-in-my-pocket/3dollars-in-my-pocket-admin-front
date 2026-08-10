import React from 'react';
import './App.css'
import './styles/layout.css'
import './styles/dashboard.css'
import './styles/page.css'
import './styles/form.css'
import './styles/push.css'
import {RouterProvider} from "react-router-dom";
import router from "./router/Router";

const App: React.FC = () => {
  return <RouterProvider router={router}/>;
};

export default App;
