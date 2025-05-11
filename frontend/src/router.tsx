import { createBrowserRouter, Navigate } from "react-router-dom";
import DirectChatDetailsPage from "./pages/DirectChatDetailsPage";
import EmptyChatPage from "./pages/EmptyChatPage";
import DirectChatPage from "./pages/DirectChatPage";
import GroupChatDetailsPage from "./pages/GroupChatDetailsPage";
import GroupChatPage from "./pages/GroupChatPage";
import RootLayout from "./pages/RootLayout";
import NotFound from "./components/Users/NotFound";

import Authentication from "./components/Users/Authentication";
import TestMainContent from "./components/Layout/TestMainContent";
import Friends from "./components/Friends/Friends";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";

// const router = createBrowserRouter([
//   {
//     path: "/login",
//     element: <TestMainContent />,
//   },
//   {
//     path: "/", // RootLayout이 모든 경로에 적용
//     element: (
//       // <Authentication>
//       <RootLayout />
//       // </Authentication>
//     ),
//     errorElement: <NotFound />,
//     children: [
//       { index: true, element: <Navigate to="/me" replace /> }, // 루트 경로 접근 시 /me로 리다이렉트
//       {
//         path: "me",
//         element: <DirectChatPage />, // 기본 /me 경로 및 레이아웃 역할
//         children: [
//           { index: true, element: <EmptyChatPage /> },
//           {
//             path: ":roomId",
//             element: (
//               <Authentication>
//                 <DirectChatDetailsPage />
//               </Authentication>
//             ),
//           },
//         ],
//       },
//       {
//         path: "group-chat",
//         element: <GroupChatPage />,
//       },
//       {
//         path: "group-chat/:roomId",
//         element: (
//           <Authentication>
//             <GroupChatDetailsPage />
//           </Authentication>
//         ),
//       },
//     ],
//   },
// ]);

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/", element: <Navigate to="/login" replace /> },

  {
    path: "/me",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <DirectChatPage />, // 여기서 서브 사이드바 + Outlet 포함
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
