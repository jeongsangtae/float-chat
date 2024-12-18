import { createBrowserRouter, Navigate } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DirectChatPage from "./pages/DirectChatPage";
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
        children: [
          { index: true, element: <MainPage /> }, //기본 /me 경로
          // { path: ":userId", element: <DirectChatPage /> }, // 1:1 채팅 페이지
          { path: "userId", element: <DirectChatPage /> },
        ],
      },
      // { path: "/:roomId", element: <GroupChatPage /> }, // 그룹 채팅 페이지
      { path: "roomId", element: <GroupChatPage /> },
    ],
  },
]);

export default router;
