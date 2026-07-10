import { Outlet, useNavigate } from "react-router-dom";

import useSocketStore from "../store/socketStore";

import Layout from "../components/Layout/Layout";

const RootLayout = () => {
  const navigate = useNavigate();
  const { leaveChatRoom } = useSocketStore();

  // 채팅방을 나가고 홈으로 이동
  const leaveChatRoomHandler = (): void => {
    leaveChatRoom();
    navigate("/me");
  };

  return (
    <Layout onLeaveChatRoom={leaveChatRoomHandler}>
      <Outlet />
    </Layout>
  );
};

export default RootLayout;
