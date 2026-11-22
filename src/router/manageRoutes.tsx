import {lazy} from "react";
import {Navigate} from "react-router";
import PrivateRouter from "./PrivateRouter";
import PermissionGuard from "@/components/auth/PermissionGuard";
import {AdminRole} from "@/types/admin";
import type {StoreActivityTabKey} from "@/pages/store/StoreActivityManagement";

// 관리 페이지는 라우트 진입 시점에 로드합니다. (Suspense fallback은 Layout에 있음)
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Advertisement = lazy(() => import("../pages/advertisement/Advertisement"));
const Registration = lazy(() => import("../pages/registration/Registration"));
const FaqManagement = lazy(() => import("../pages/faq/Faq"));
const Policy = lazy(() => import("../pages/policy/Policy"));
const Push = lazy(() => import("../pages/push/Push"));
const UserSearch = lazy(() => import("../pages/user/UserSearch"));
const StoreSearchManagement = lazy(() => import("../pages/store/StoreSearchManagement"));
const SimilarStoreSearch = lazy(() => import("../pages/store/SimilarStoreSearch"));
const StoreDuplicateCandidateManagement = lazy(() => import("../pages/store/StoreDuplicateCandidateManagement"));
const StoreCategoryManagement = lazy(() => import("../pages/storeCategory/StoreCategoryManagement"));
const CacheTool = lazy(() => import("../pages/tool/CacheTool"));
const FileUploadTool = lazy(() => import("../pages/tool/FileUploadTool"));
const RandomNameTool = lazy(() => import("../pages/tool/RandomNameTool"));
const Admin = lazy(() => import("../pages/admin/Admin"));
const PollManagement = lazy(() => import("../pages/poll/PollManagement"));
const MedalManagement = lazy(() => import("../pages/medal/MedalManagement"));
const MissionManagement = lazy(() => import("../pages/mission/MissionManagement"));
const RaffleManagement = lazy(() => import("../pages/raffle/RaffleManagement"));
const PointBalanceManagement = lazy(() => import("../pages/point/PointBalanceManagement"));
const UserRankingManagement = lazy(() => import("../pages/userRanking/UserRankingManagement"));
const StoreMarkerManage = lazy(() => import("../pages/manage/StoreMarkerManage"));
const PromptManagement = lazy(() => import("../pages/prompt/PromptManagement"));
const AiMenuImageExtract = lazy(() => import("../pages/proto/AiMenuImageExtract"));
const StoreActivityManagement = lazy(() => import("../pages/store/StoreActivityManagement"));
const StoreFileUpload = lazy(() => import("../pages/store/StoreFileUpload"));
const ScreenSectionLayoutManagement = lazy(() => import("../pages/screenSectionLayout/ScreenSectionLayoutManagement"));
const ExperimentOverrideManagement = lazy(() => import("../pages/experiment/ExperimentOverrideManagement"));

const LEGACY_STORE_ACTIVITY_PATHS: [string, StoreActivityTabKey][] = [
  ['/manage/review', 'review'],
  ['/manage/store-image', 'image'],
  ['/manage/store-report', 'report'],
  ['/manage/store-post', 'post'],
  ['/manage/coupon', 'coupon'],
  ['/manage/store-message', 'message'],
];

const manageRoutes = {
  path: '/manage',
  children: [
    {
      path: '/manage',
      element: <PrivateRouter><Dashboard/></PrivateRouter>
    },
    {
      path: '/manage/advertisement',
      element: <PrivateRouter><Advertisement/></PrivateRouter>
    },
    {
      path: '/manage/registration',
      element: <PrivateRouter><Registration/></PrivateRouter>
    },
    {
      path: '/manage/faq',
      element: <PrivateRouter><FaqManagement/></PrivateRouter>
    },
    {
      path: '/manage/medal',
      element: <PrivateRouter><MedalManagement/></PrivateRouter>
    },
    {
      path: '/manage/mission',
      element: (
        <PrivateRouter>
          <PermissionGuard allowedRoles={[AdminRole.OPERATOR]}>
            <MissionManagement/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/raffle',
      element: <PrivateRouter><RaffleManagement/></PrivateRouter>
    },
    {
      path: '/manage/point-balance',
      element: <PrivateRouter><PointBalanceManagement/></PrivateRouter>
    },
    {
      path: '/manage/policy',
      element: <PrivateRouter><Policy/></PrivateRouter>
    },
    {
      path: '/manage/push-message',
      element: <PrivateRouter><Push/></PrivateRouter>
    },
    {
      path: '/manage/user-search',
      element: <PrivateRouter><UserSearch/></PrivateRouter>
    },
    {
      path: '/manage/store-search',
      element: <PrivateRouter><StoreSearchManagement/></PrivateRouter>
    },
    {
      path: '/manage/store-file-upload',
      element: (
        <PrivateRouter>
          <PermissionGuard allowedRoles={[AdminRole.OPERATOR]}>
            <StoreFileUpload/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/store-activity',
      element: <PrivateRouter><StoreActivityManagement/></PrivateRouter>
    },
    // 가게 활동 관리 페이지로 통합되기 전 경로 (북마크 호환)
    ...LEGACY_STORE_ACTIVITY_PATHS.map(([path, tab]) => ({
      path,
      element: <Navigate to={`/manage/store-activity?tab=${tab}`} replace/>
    })),
    // 가게 검색 페이지의 탭으로 통합되기 전 경로 (북마크 호환)
    {
      path: '/manage/popular-neighborhood-stores',
      element: <Navigate to="/manage/store-search?tab=popular" replace/>
    },
    {
      path: '/manage/store-duplicate-candidate',
      element: (
        <PrivateRouter>
          <PermissionGuard allowedRoles={[AdminRole.OPERATOR]}>
            <StoreDuplicateCandidateManagement/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/proto/similar-store',
      element: <PrivateRouter><SimilarStoreSearch/></PrivateRouter>
    },
    {
      path: '/manage/store-category',
      element: <PrivateRouter><StoreCategoryManagement/></PrivateRouter>
    },
    {
      path: '/manage/prompt',
      element: (
        <PrivateRouter>
          <PermissionGuard
            allowedRoles={[AdminRole.OWNER]}
            fallback={
              <div className="container-fluid py-5 text-center text-muted">
                <i className="bi bi-lock-fill fs-1 d-block mb-3"></i>
                <h4 className="fw-bold">접근 권한이 없습니다</h4>
                <p className="mb-0">AI 프롬프트 관리는 소유자만 접근할 수 있습니다.</p>
              </div>
            }
          >
            <PromptManagement/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/proto/ai-menu-image-extract',
      element: (
        <PrivateRouter>
          <PermissionGuard
            allowedRoles={[AdminRole.OPERATOR, AdminRole.VIEWER]}
            fallback={
              <div className="container-fluid py-5 text-center text-muted">
                <i className="bi bi-lock-fill fs-1 d-block mb-3"></i>
                <h4 className="fw-bold">접근 권한이 없습니다</h4>
                <p className="mb-0">AI 메뉴 이미지 추출은 뷰어 이상만 접근할 수 있습니다.</p>
              </div>
            }
          >
            <AiMenuImageExtract/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/tool/cache',
      element: <PrivateRouter><CacheTool/></PrivateRouter>
    },
    {
      path: '/manage/tool/upload',
      element: <PrivateRouter><FileUploadTool/></PrivateRouter>
    },
    {
      path: '/manage/tool/random-name',
      element: <PrivateRouter><RandomNameTool/></PrivateRouter>
    },
    {
      path: '/manage/admin',
      element: <PrivateRouter><Admin/></PrivateRouter>
    },
    {
      path: '/manage/poll',
      element: <PrivateRouter><PollManagement/></PrivateRouter>
    },
    {
      path: '/manage/user-ranking',
      element: <PrivateRouter><UserRankingManagement/></PrivateRouter>
    },
    {
      path: '/manage/store-marker',
      element: (
        <PrivateRouter>
          <PermissionGuard allowedRoles={[AdminRole.OPERATOR]}>
            <StoreMarkerManage/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/push-ab-test',
      element: (
        <PrivateRouter>
          <PermissionGuard
            allowedRoles={[AdminRole.OWNER]}
            fallback={
              <div className="container-fluid py-5 text-center text-muted">
                <i className="bi bi-lock-fill fs-1 d-block mb-3"></i>
                <h4 className="fw-bold">접근 권한이 없습니다</h4>
                <p className="mb-0">A/B 테스트 대상 관리는 오너만 접근할 수 있습니다.</p>
              </div>
            }
          >
            <ExperimentOverrideManagement/>
          </PermissionGuard>
        </PrivateRouter>
      )
    },
    {
      path: '/manage/screen-section-layout',
      element: (
        <PrivateRouter>
          <PermissionGuard
            allowedRoles={[AdminRole.OPERATOR, AdminRole.VIEWER]}
            fallback={
              <div className="container-fluid py-5 text-center text-muted">
                <i className="bi bi-lock-fill fs-1 d-block mb-3"></i>
                <h4 className="fw-bold">접근 권한이 없습니다</h4>
                <p className="mb-0">UI 구성 관리는 뷰어 이상만 접근할 수 있습니다.</p>
              </div>
            }
          >
            <ScreenSectionLayoutManagement/>
          </PermissionGuard>
        </PrivateRouter>
      )
    }
  ]
};

export default manageRoutes;
