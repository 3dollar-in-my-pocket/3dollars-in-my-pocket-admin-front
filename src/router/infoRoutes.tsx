import { lazy } from "react";
import PrivateRouter from "./PrivateRouter";

// 정보 페이지는 라우트 진입 시점에 로드합니다. (Suspense fallback은 Layout에 있음)
const PushStatInfo = lazy(() => import("../pages/info/PushStatInfo"));
const ServiceStatInfo = lazy(() => import("../pages/info/ServiceStatInfo"));
const EtcLinkInfo = lazy(() => import("../pages/info/EtcLinkInfo"));
const AdStatInfo = lazy(() => import("../pages/info/AdStatInfo"));

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