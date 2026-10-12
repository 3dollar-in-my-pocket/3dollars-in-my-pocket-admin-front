import {lazy} from "react";
import {Navigate} from "react-router-dom";
import PrivateRouter from "./PrivateRouter";
import type {StatisticsTabKey} from "@/pages/info/Statistics";

// 정보 페이지는 라우트 진입 시점에 로드합니다. (Suspense fallback은 Layout에 있음)
const Statistics = lazy(() => import("../pages/info/Statistics"));
const EtcLinkInfo = lazy(() => import("../pages/info/EtcLinkInfo"));

// 통계 페이지로 통합되기 전 경로 (북마크 호환)
const LEGACY_STATISTICS_PATHS: [string, StatisticsTabKey][] = [
  ['/info/service-statistics', 'server'],
  ['/info/ad-statistics', 'ad'],
  ['/info/push-statistics', 'push'],
];

const infoRoutes = {
  path: '/info',
  children: [
    {
      path: '/info/statistics',
      element: <PrivateRouter><Statistics/></PrivateRouter>
    },
    ...LEGACY_STATISTICS_PATHS.map(([path, tab]) => ({
      path,
      element: <Navigate to={`/info/statistics?tab=${tab}`} replace/>
    })),
    {
      path: '/info/etc-link',
      element: <PrivateRouter><EtcLinkInfo/></PrivateRouter>
    },
  ]
};

export default infoRoutes;
