import { Outlet } from "react-router-dom";

import DirectChatMainContent from "../components/DirectChats/DirectChatMainContent";

const DirectChatPage = () => {
  return (
    <>
      <DirectChatMainContent>{<Outlet />}</DirectChatMainContent>
    </>
  );
};

export default DirectChatPage;
