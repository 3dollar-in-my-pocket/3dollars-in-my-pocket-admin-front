import {createBrowserRouter} from "react-router-dom";
import Home from "../pages/Home";
import Layout from "../pages/Layout";
import Advertisement from "../pages/advertisement/Advertisement";
import Push from "../pages/push/Push";
import Registration from "../pages/registration/Registration";
import CacheTool from "../pages/tool/CacheTool";
import FileUploadTool from "../pages/tool/FileUploadTool";
import GoogleCallback from "../pages/auth/google/GoogleCallback";
import PrivateRouter from "./PrivateRouter";
import Dashboard from "../pages/Dashboard";

const Router = createBrowserRouter([
        {
            path: `/`,
            element: <Layout/>,
            children: [
                {
                    index: true,
                    element: <Home/>
                },
                {
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
                            path: '/manage/push-message',
                            element: <PrivateRouter><Push/></PrivateRouter>
                        },
                        {
                            path: '/manage/registration',
                            element: <PrivateRouter><Registration/></PrivateRouter>
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
                },
                {
                    path: '/auth',
                    children: [
                        {
                            path: '/auth/google/callback',
                            element: <GoogleCallback/>
                        },
                    ]
                }
            ]
        },
    ]
)

export default Router;
