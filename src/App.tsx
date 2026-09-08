import React from 'react';
import './App.css'
import './styles/layout.css'
import './styles/dashboard.css'
import './styles/page.css'
import './styles/form.css'
import './styles/push.css'
import {RouterProvider} from "react-router-dom";
import router from "./router/Router";
import {ConfirmProvider} from "./hooks/useConfirm";

const App: React.FC = () => {
  return (
    <ConfirmProvider>
      <RouterProvider router={router}/>
    </ConfirmProvider>
  );
};

export default App;
