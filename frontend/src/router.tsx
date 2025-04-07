import { createBrowserRouter, Navigate } from "react-router-dom";
import DirectChatDetailsPage from "./pages/DirectChatDetailsPage";
import EmptyChatPage from "./pages/EmptyChatPage";
import DirectChatPage from "./pages/DirectChatPage";
import GroupChatDetailsPage from "./pages/GroupChatDetailsPage";
import GroupChatPage from "./pages/GroupChatPage";
import RootLayout from "./pages/RootLayout";

const router = createBrowserRouter([
  {
    path: "/", // RootLayout이 모든 경로에 적용
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/me" replace /> }, // 루트 경로 접근 시 /me로 리다이렉트
      {
        path: "me",
        element: <DirectChatPage />,
        children: [
          { index: true, element: <EmptyChatPage /> }, // 기본 /me 경로
          { path: ":roomId", element: <DirectChatDetailsPage /> },
        ],
      },
      {
        path: "group-chat",
        element: <GroupChatPage />,
      },
      { path: "group-chat/:roomId", element: <GroupChatDetailsPage /> },
    ],
  },
]);

export default router;
