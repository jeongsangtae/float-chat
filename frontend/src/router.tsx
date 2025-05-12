import { createBrowserRouter, Navigate } from "react-router-dom";
import DirectChatDetailsPage from "./pages/DirectChatDetailsPage";
import DirectChatPage from "./pages/DirectChatPage";
import GroupChatDetailsPage from "./pages/GroupChatDetailsPage";
import GroupChatPage from "./pages/GroupChatPage";
import RootLayout from "./pages/RootLayout";
import NotFound from "./components/Users/NotFound";

import Authentication from "./components/Users/Authentication";
import Friends from "./components/Friends/Friends";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/", element: <Navigate to="/login" replace /> }, // 루트 경로 접근 시 /login으로 리다이렉트
  {
    path: "/me",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <DirectChatPage />, // 메인 콘텐츠 + 서브 사이드바 + Outlet 포함
        children: [
          { index: true, element: <Friends /> }, // 친구 관련 내용
          {
            path: ":roomId",
            element: (
              <Authentication>
                <DirectChatDetailsPage />
              </Authentication>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "group-chat",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <GroupChatPage /> },
      {
        path: ":roomId",
        element: (
          <Authentication>
            <GroupChatDetailsPage />
          </Authentication>
        ),
      },
    ],
  },
]);

export default router;
