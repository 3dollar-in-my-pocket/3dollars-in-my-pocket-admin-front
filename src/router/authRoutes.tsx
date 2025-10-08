import GoogleCallback from "../pages/auth/google/GoogleCallback";

const authRoutes = {
  path: '/auth',
  children: [
    {
      path: '/auth/google/callback',
      element: <GoogleCallback/>
    },
  ]
};

export default authRoutes; 