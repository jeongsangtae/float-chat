import { Outlet, Link, useNavigate } from "react-router-dom";
// import MainHeader from "../components/Layout/MainHeader";
import useSocketStore from "../store/socketStore";
import SideBar from "../components/Layout/SideBar";

const RootLayout = () => {
  const navigate = useNavigate();
  const { leaveGroupChat } = useSocketStore();

  const leaveGroupChatHandler = () => {
    leaveGroupChat();
    navigate("/");
  };

  return (
    <>
      {/* <Link to={`/`}>아이콘 들어갈 위치</Link> */}
      <button onClick={leaveGroupChatHandler}> 아이콘 들어갈 위치</button>
      <Outlet />
      <SideBar />
      {/* <MainHeader /> */}
    </>
  );
};

export default RootLayout;
