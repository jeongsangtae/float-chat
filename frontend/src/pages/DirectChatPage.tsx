import { Outlet } from "react-router-dom";

import DirectChats from "../components/DirectChats/DirectChats";
import DirectChatMainContent from "../components/DirectChats/DirectChatMainContent";
import DirectChatSidebar from "../components/DirectChats/DirectChatSidebar";

const DirectChatPage = () => {
  return (
    <>
      {/* <DirectChats /> */}
      <DirectChatMainContent>{<Outlet />}</DirectChatMainContent>
    </>
  );
};

export default DirectChatPage;
