import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DirectChatPage from "./pages/DirectChatPage";
import GroupChatPage from "./pages/GroupChatPage";
import RootLayout from "./pages/RootLayout";

const router = createBrowserRouter([
  {
    path: "/me",
    element: <RootLayout />,
    children: [
      { index: true, element: <MainPage /> },
      { path: ":userId", element: <DirectChatPage /> },
    ],
  },
  { path: "/:roomId", element: <GroupChatPage /> },
]);

export default router;
