import { Outlet } from "react-router-dom";

import DirectChats from "../components/DirectChats/DirectChats";

const DirectChatPage = () => {
  return (
    <>
      <DirectChats />
      <Outlet />
    </>
  );
};

export default DirectChatPage;
