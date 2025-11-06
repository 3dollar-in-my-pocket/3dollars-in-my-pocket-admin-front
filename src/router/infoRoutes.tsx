import PrivateRouter from "./PrivateRouter";
import PushStatInfo from "../pages/info/PushStatInfo";
import ServiceStatInfo from "../pages/info/ServiceStatInfo";
import EtcLinkInfo from "../pages/info/EtcLinkInfo";
import AdStatInfo from "../pages/info/AdStatInfo";

const infoRoutes = {
  path: '/info',
  children: [
    {
      path: '/info/push-statistics',
      element: <PrivateRouter><PushStatInfo/></PrivateRouter>
    },
    {
      path: '/info/service-statistics',
      element: <PrivateRouter><ServiceStatInfo/></PrivateRouter>
    },
    {
      path: '/info/ad-statistics',
      element: <PrivateRouter><AdStatInfo/></PrivateRouter>
    },
    {
      path: '/info/etc-link',
      element: <PrivateRouter><EtcLinkInfo/></PrivateRouter>
    },
  ]
};

export default infoRoutes; 