import { Outlet, useNavigate } from "react-router-dom";
// import MainHeader from "../components/Layout/MainHeader";
import Notification from "../components/UI/Notification";
import useSocketStore from "../store/socketStore";

import SideBar from "../components/Layout/SideBar";

const RootLayout = () => {
  const navigate = useNavigate();
  const { leaveGroupChat } = useSocketStore();

  // 함수 이름 변경 필요
  const leaveGroupChatHandler = (): void => {
    leaveGroupChat();
    navigate("/");
  };

  return (
    <>
      <button onClick={leaveGroupChatHandler}> 아이콘 들어갈 위치</button>
      <Outlet />
      <SideBar />
      <Notification />
      {/* <MainHeader /> */}
    </>
  );
};

export default RootLayout;
