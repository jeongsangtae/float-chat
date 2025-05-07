import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./pages/RootLayout";
import NotFound from "./components/Users/NotFound";

import TestMainContent from "./components/Layout/TestMainContent";

const router = createBrowserRouter([
  {
    path: "/", // RootLayout이 모든 경로에 적용
    element: <TestMainContent />,
    errorElement: <NotFound />,
  },
]);

export default router;
