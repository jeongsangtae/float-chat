import { Outlet } from "react-router-dom";

import DirectChats from "../components/DirectChats/DirectChats";
import Friends from "../components/Friends/Friends";

const DirectChatPage = () => {
  return (
    <>
      <Friends />
      <DirectChats />
      <Outlet />
    </>
  );
};

export default DirectChatPage;
