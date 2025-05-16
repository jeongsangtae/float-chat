import { Outlet, useNavigate } from "react-router-dom";

import useSocketStore from "../store/socketStore";

import Layout from "../components/Layout/Layout";

const RootLayout = () => {
  const navigate = useNavigate();
  const { leaveGroupChat } = useSocketStore();

  // 함수 이름 변경 필요
  const leaveGroupChatHandler = (): void => {
    leaveGroupChat();
    navigate("/me");
  };

  return (
    <Layout onLeaveGroupChat={leaveGroupChatHandler}>
      <Outlet />
    </Layout>
  );
};

export default RootLayout;
