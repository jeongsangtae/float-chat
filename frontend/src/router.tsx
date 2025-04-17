import { createBrowserRouter, Navigate } from "react-router-dom";
import DirectChatDetailsPage from "./pages/DirectChatDetailsPage";
import EmptyChatPage from "./pages/EmptyChatPage";
import DirectChatPage from "./pages/DirectChatPage";
import GroupChatDetailsPage from "./pages/GroupChatDetailsPage";
import GroupChatPage from "./pages/GroupChatPage";
import RootLayout from "./pages/RootLayout";
import NotFound from "./components/Users/NotFound";

import Authentication from "./components/Users/Authentication";

const router = createBrowserRouter([
  {
    path: "/", // RootLayout이 모든 경로에 적용
    element: (
      <Authentication>
        <RootLayout />
      </Authentication>
    ),
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/me" replace /> }, // 루트 경로 접근 시 /me로 리다이렉트
      {
        path: "me",
        element: (
          <Authentication>
            <DirectChatPage />
          </Authentication>
        ), // 기본 /me 경로 및 레이아웃 역할
        children: [
          { index: true, element: <EmptyChatPage /> },
          {
            path: ":roomId",
            element: <DirectChatDetailsPage />,
          },
        ],
      },
      {
        path: "group-chat",
        element: <GroupChatPage />,
      },
      {
        path: "group-chat/:roomId",
        element: <GroupChatDetailsPage />,
      },
    ],
  },
]);

export default router;
