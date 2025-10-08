import {createBrowserRouter} from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../pages/Layout";
import manageRoutes from "./manageRoutes";
import infoRoutes from "./infoRoutes";
import authRoutes from "./authRoutes";

const Router = createBrowserRouter([
  {
    path: `/`,
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <Home/>
      },
      manageRoutes,
      infoRoutes,
      authRoutes
    ]
  },
]);

export default Router;
