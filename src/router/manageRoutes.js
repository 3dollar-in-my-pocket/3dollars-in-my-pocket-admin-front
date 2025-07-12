import Dashboard from "../pages/Dashboard";
import Advertisement from "../pages/advertisement/Advertisement";
import Registration from "../pages/registration/Registration";
import FaqManagement from "../pages/faq/Faq";
import Policy from "../pages/policy/Policy";
import Push from "../pages/push/Push";
import CacheTool from "../pages/tool/CacheTool";
import FileUploadTool from "../pages/tool/FileUploadTool";
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
      path: '/manage/tool/cache',
      element: <PrivateRouter><CacheTool/></PrivateRouter>
    },
    {
      path: '/manage/tool/upload',
      element: <PrivateRouter><FileUploadTool/></PrivateRouter>
    }
  ]
};

export default manageRoutes; 