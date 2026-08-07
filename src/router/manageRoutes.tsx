import {lazy} from "react";
import PrivateRouter from "./PrivateRouter";
import PermissionGuard from "@/components/auth/PermissionGuard";
import {AdminRole} from "@/types/admin";

// 관리 페이지는 라우트 진입 시점에 로드합니다. (Suspense fallback은 Layout에 있음)
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Advertisement = lazy(() => import("../pages/advertisement/Advertisement"));
const Registration = lazy(() => import("../pages/registration/Registration"));
const FaqManagement = lazy(() => import("../pages/faq/Faq"));
const Policy = lazy(() => import("../pages/policy/Policy"));
const Push = lazy(() => import("../pages/push/Push"));
const UserSearch = lazy(() => import("../pages/user/UserSearch"));
const StoreSearch = lazy(() => import("../pages/store/StoreSearch"));
const PopularNeighborhoodStores = lazy(() => import("../pages/store/PopularNeighborhoodStores"));
const ReviewManagement = lazy(() => import("../pages/review/ReviewManagement"));
const StoreMessageManagement = lazy(() => import("../pages/storeMessage/StoreMessageManagement"));
const StoreCategoryManagement = lazy(() => import("../pages/storeCategory/StoreCategoryManagement"));
const CouponManagement = lazy(() => import("../pages/coupon/CouponManagement"));
const CacheTool = lazy(() => import("../pages/tool/CacheTool"));
const FileUploadTool = lazy(() => import("../pages/tool/FileUploadTool"));
const RandomNameTool = lazy(() => import("../pages/tool/RandomNameTool"));
const Admin = lazy(() => import("../pages/admin/Admin"));
const PollManagement = lazy(() => import("../pages/poll/PollManagement"));
const MedalManagement = lazy(() => import("../pages/medal/MedalManagement"));
const UserRankingManagement = lazy(() => import("../pages/userRanking/UserRankingManagement"));
const StoreImageManage = lazy(() => import("../pages/manage/StoreImageManage"));
const StoreMarkerManage = lazy(() => import("../pages/manage/StoreMarkerManage"));
const StoreReportManagement = lazy(() => import("../pages/storeReport/StoreReportManagement"));
const StorePostManagement = lazy(() => import("../pages/storePost/StorePostManagement"));
const PromptManagement = lazy(() => import("../pages/prompt/PromptManagement"));
const AiMenuImageExtract = lazy(() => import("../pages/proto/AiMenuImageExtract"));
const StoreFileUpload = lazy(() => import("../pages/store/StoreFileUpload"));

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
      element: <PrivateRouter><StoreSearch/></PrivateRouter>
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
      path: '/manage/popular-neighborhood-stores',
      element: <PrivateRouter><PopularNeighborhoodStores/></PrivateRouter>
    },
    {
      path: '/manage/review',
      element: <PrivateRouter><ReviewManagement/></PrivateRouter>
    },
    {
      path: '/manage/coupon',
      element: <PrivateRouter><CouponManagement/></PrivateRouter>
    },
    {
      path: '/manage/store-message',
      element: <PrivateRouter><StoreMessageManagement/></PrivateRouter>
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
      path: '/manage/store-image',
      element: <PrivateRouter><StoreImageManage/></PrivateRouter>
    },
    {
      path: '/manage/store-marker',
      element: <PrivateRouter><StoreMarkerManage/></PrivateRouter>
    },
    {
      path: '/manage/store-report',
      element: <PrivateRouter><StoreReportManagement/></PrivateRouter>
    },
    {
      path: '/manage/store-post',
      element: <PrivateRouter><StorePostManagement/></PrivateRouter>
    }
  ]
};

export default manageRoutes;
