import Dashboard from "../pages/Dashboard";
import Advertisement from "../pages/advertisement/Advertisement";
import Registration from "../pages/registration/Registration";
import FaqManagement from "../pages/faq/Faq";
import Policy from "../pages/policy/Policy";
import Push from "../pages/push/Push";
import UserSearch from "../pages/user/UserSearch";
import StoreSearch from "../pages/store/StoreSearch";
import ReviewManagement from "../pages/review/ReviewManagement";
import StoreMessageManagement from "../pages/storeMessage/StoreMessageManagement";
import CacheTool from "../pages/tool/CacheTool";
import FileUploadTool from "../pages/tool/FileUploadTool";
import RandomNameTool from "../pages/tool/RandomNameTool";
import Admin from "../pages/admin/Admin";
import PollManagement from "../pages/poll/PollManagement";
import PrivateRouter from "./PrivateRouter";

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
      element: <PrivateRouter><StoreSearch /></PrivateRouter>
    },
    {
      path: '/manage/review',
      element: <PrivateRouter><ReviewManagement /></PrivateRouter>
    },
    {
      path: '/manage/store-message',
      element: <PrivateRouter><StoreMessageManagement /></PrivateRouter>
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
    }
  ]
};

export default manageRoutes;
