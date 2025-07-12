import PrivateRouter from "./PrivateRouter";
import PushStatInfo from "../pages/info/PushStatInfo";

const infoRoutes = {
  path: '/info',
  children: [
    {
      path: '/info/push-statistics',
      element: <PrivateRouter><PushStatInfo/></PrivateRouter>
    },
  ]
};

export default infoRoutes; 